import json


def parse_sequential_palettes(data):
    return { key for key in data if data[key]["type"] == "seq" }


def parse_rgb(text):
    return [int(c) for c in text.replace("rgb", "")
                                .replace("(", "")
                                .replace(")", "")
                                .split(",")]


def elm_import(module, exposing):
    return f"import {module} exposing ({exposing})"


def elm_union_type(name, variants):
    code = " | ".join(variants)
    return f"type {name} = {code}"


def elm_list(items):
    content = ", ".join([item for item in items])
    return f"[{ content }]"


def elm_string(item):
    return f'"{item}"'


def elm_rgb(r, g, b):
    return f"rgb255 {r} {g} {b}"


def main():
    with open("colorbrewer.json") as stream:
        data = json.load(stream)
        print("module Generated exposing (..)\n")
        print("")
        print(elm_import("Colorbrewer", "rgb255"))
        print("")
        print(elm_union_type("Brewer", sorted(data.keys())))
        print("")
        print(f"toColors : Brewer -> Int -> List Colorbrewer.Color")
        print(f"toColors brewer n =")
        print_indent(1, "case brewer of")
        for key in data:
            print_indent(2, f"{key} ->")
            print_indent(3, f"case n of")
            for level in data[key]:
                if level == "type":
                    continue
                snippets = []
                for item in data[key][level]:
                    r, g, b = parse_rgb(item)
                    snippets.append(elm_rgb(r, g, b))
                code = elm_list(snippets)
                print_indent(4, f"{level} ->")
                print_indent(5, f"{code}")
            print_indent(4, "_ ->")
            print_indent(5, "[]")


def print_indent(tabs, text):
    print(indent(tabs, text))

def indent(tabs, text):
    return ("   " * tabs) + text


if __name__ == '__main__':
    main()
