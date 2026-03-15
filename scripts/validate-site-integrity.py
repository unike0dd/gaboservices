#!/usr/bin/env python3
"""Validate links, references, triggers, actions, events, and function hooks across the site."""
from __future__ import annotations

import argparse
import re
import sys
from html.parser import HTMLParser
from pathlib import Path
from typing import List, Optional, Set, Tuple

ROOT = Path(__file__).resolve().parents[1]

EVENT_ATTR_PATTERN = re.compile(r"^on[a-z]+$", re.I)
FUNC_DECL_PATTERN = re.compile(r"\bfunction\s+([A-Za-z_$][\w$]*)\s*\(")
ARROW_DECL_PATTERN = re.compile(r"\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s+)?(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>")
INLINE_CALL_PATTERN = re.compile(r"^\s*(?:return\s+)?(?:window\.)?([A-Za-z_$][\w$]*)\s*(?:\?|)\.?(?:\s*)\(")
PLACEHOLDER_PATTERN = re.compile(r"\{\{.*?\}\}|\$\{.*?\}")


class HtmlAuditParser(HTMLParser):
    def __init__(self, file_path: Path):
        super().__init__(convert_charrefs=True)
        self.file_path = file_path
        self.ids: Set[str] = set()
        self.refs: List[Tuple[str, int, str, str]] = []
        self.links: List[Tuple[str, int, str, str]] = []
        self.inline_handlers: List[Tuple[str, int, str, str]] = []
        self.data_targets: List[Tuple[str, int, str]] = []

    def handle_starttag(self, tag, attrs):
        attrs_map = dict(attrs)
        if "id" in attrs_map:
            self.ids.add(attrs_map["id"])

        for name, value in attrs:
            if value is None:
                continue
            if name in {"href", "src", "action"}:
                self.links.append((tag, self.getpos()[0], name, value))
            if name in {"aria-labelledby", "aria-describedby", "for", "list"}:
                self.refs.append((tag, self.getpos()[0], name, value))
            if EVENT_ATTR_PATTERN.match(name):
                self.inline_handlers.append((tag, self.getpos()[0], name, value.strip()))
            if name == "data-target":
                self.data_targets.append((tag, self.getpos()[0], value.strip()))


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8", errors="ignore")


def collect_function_names(js_files: List[Path]) -> Set[str]:
    names: Set[str] = set()
    for path in js_files:
        text = read_text(path)
        names.update(FUNC_DECL_PATTERN.findall(text))
        names.update(ARROW_DECL_PATTERN.findall(text))
    return names


def is_external(value: str) -> bool:
    return value.startswith(("http://", "https://", "mailto:", "tel:", "data:", "javascript:", "//"))


def is_templated(value: str) -> bool:
    return bool(PLACEHOLDER_PATTERN.search(value))


def resolve_target(source_file: Path, value: str) -> Path:
    clean = value.split("#", 1)[0].split("?", 1)[0]
    if clean.startswith("/"):
        return ROOT / clean[1:]
    return (source_file.parent / clean).resolve()


def normalize_target_for_html(tag: str, target: Path) -> Optional[Path]:
    if target.exists():
        return target
    # `<a href="/about">` is common for static sites where page lives in `/about/index.html`.
    if tag in {"a", "form"} and not target.suffix:
        index_candidate = target / "index.html"
        if index_candidate.exists():
            return index_candidate
        html_candidate = target.with_suffix(".html")
        if html_candidate.exists():
            return html_candidate
    return None


def audit(verbose: bool = False) -> int:
    html_files = sorted(ROOT.rglob("*.html"))
    js_files = sorted(ROOT.rglob("*.js"))
    known_functions = collect_function_names(js_files)

    issues: List[str] = []

    for html_file in html_files:
        parser = HtmlAuditParser(html_file)
        parser.feed(read_text(html_file))

        # Links and actions
        for tag, line, attr, value in parser.links:
            if not value or value == "#" or value.startswith("#") or is_external(value) or is_templated(value):
                continue
            target = resolve_target(html_file, value)
            normalized_target = normalize_target_for_html(tag, target)
            if normalized_target is None:
                rel = html_file.relative_to(ROOT)
                try:
                    missing = target.relative_to(ROOT)
                except ValueError:
                    missing = target
                issues.append(f"[link/action] {rel}:{line} {tag}[{attr}] -> {value} (missing {missing})")
            elif verbose:
                rel = html_file.relative_to(ROOT)
                issues.append(f"[ok-link] {rel}:{line} {tag}[{attr}] -> {value}")

        # References
        for tag, line, attr, value in parser.refs:
            ids = value.split() if attr.startswith("aria-") else [value]
            for ref_id in ids:
                if ref_id and ref_id not in parser.ids:
                    rel = html_file.relative_to(ROOT)
                    issues.append(f"[reference] {rel}:{line} {tag}[{attr}] -> {ref_id} (id not found in same document)")

        # Trigger consistency (data-target fragments)
        for tag, line, target in parser.data_targets:
            if target.startswith("#") and target[1:] not in parser.ids:
                rel = html_file.relative_to(ROOT)
                issues.append(f"[trigger] {rel}:{line} {tag}[data-target] -> {target} (id not found in same document)")

        # Event + function checks for inline handlers
        for tag, line, attr, handler in parser.inline_handlers:
            match = INLINE_CALL_PATTERN.match(handler)
            if not match:
                continue
            fn_name = match.group(1)
            if fn_name not in known_functions:
                rel = html_file.relative_to(ROOT)
                issues.append(f"[event/function] {rel}:{line} {tag}[{attr}] calls '{fn_name}()' but function was not found in JS files")

    print("Integrity audit scope:")
    print(f"- HTML files: {len(html_files)}")
    print(f"- JS files: {len(js_files)}")
    print(f"- Known JS functions: {len(known_functions)}")

    failing_issues = [entry for entry in issues if not entry.startswith("[ok-link]")]

    if failing_issues:
        print("\nIssues found:")
        for item in failing_issues:
            print(f"- {item}")
        return 1

    if verbose:
        print("\nVerbose checks:")
        for item in issues:
            if item.startswith("[ok-link]"):
                print(f"- {item}")

    print("\nNo issues found for links, references, triggers, actions, events, or inline function hooks.")
    return 0


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Validate links/references/triggers/actions/events/functions in site files")
    parser.add_argument("--verbose", action="store_true", help="Print per-link successful checks for easier debugging")
    args = parser.parse_args()
    sys.exit(audit(verbose=args.verbose))
