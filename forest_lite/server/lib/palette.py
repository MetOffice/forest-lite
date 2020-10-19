import bokeh.palettes


def all_palettes():
    """List of palette definitions"""
    for name in bokeh.palettes.all_palettes:
        for number in bokeh.palettes.all_palettes[name]:
            yield {
                "name": name,
                "number": number,
                "palette": bokeh.palettes.all_palettes[name][number]
            }
