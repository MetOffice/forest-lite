import argparse
import tornado.web
import tornado.ioloop
import bokeh.resources
import bokeh.palettes
from bokeh.core.json_encoder import serialize_json
import yaml
import lib


CONFIG = None


class Index(tornado.web.RequestHandler):
    def get(self):
        # self.render("index.html", resources=bokeh.resources.CDN.render())
        resources = bokeh.resources.Resources("cdn", minified=False)
        self.render("index.html", resources=resources.render())


class Data(tornado.web.RequestHandler):
    def get(self, dataset, variable):
        # self.set_header("Cache-control", "max-age=31536000")
        obj = lib.xy_data(dataset, variable)
        self.write(serialize_json(obj))


class Datasets(tornado.web.RequestHandler):
    def get(self):
        # self.set_header("Cache-control", "max-age=31536000")
        obj = sorted([dataset["name"] for dataset in CONFIG["datasets"]])
        self.set_header("Content-Type", "application/json")
        self.write(serialize_json(obj))


class Image(tornado.web.RequestHandler):
    def get(self, name):
        self.set_header("Cache-control", "max-age=31536000")
        for dataset in CONFIG["datasets"]:
            if dataset["name"] == name:
                path = dataset["file_name"]
                obj = lib.image_data(name, path)
                self.set_header("Content-Type", "application/json")
                self.write(serialize_json(obj))


class DataTime(tornado.web.RequestHandler):
    def get(self, dataset):
        # self.set_header("Cache-control", "max-age=31536000")
        obj = lib.data_times(dataset)
        self.write(serialize_json(obj))


class PaletteNames(tornado.web.RequestHandler):
    def get(self):
        names = list(bokeh.palettes.all_palettes.keys())
        self.write({"names": names})


class Palette(tornado.web.RequestHandler):
    def get(self, tail):
        parts = tail.split("/")
        if len(parts) == 1:
            name, = parts
            numbers = list(bokeh.palettes.all_palettes[name].keys())
            self.write({"numbers": numbers})
        elif len(parts) == 2:
            name, number = parts
            number = int(number)
            self.write({"palette": bokeh.palettes.all_palettes[name][number]})


def main():
    global CONFIG
    parser = argparse.ArgumentParser()
    parser.add_argument("--port", type=int, default=8888)
    parser.add_argument("config_file")
    args = parser.parse_args()
    with open(args.config_file) as stream:
        CONFIG = yaml.safe_load(stream)

    app = tornado.web.Application([
        ("/", Index),
        ("/datasets", Datasets),
        ("/data/(.*)/(.*)", Data),
        ("/image/(.*)", Image),
        ("/palette", PaletteNames),
        ("/palette/(.*)", Palette),
        ("/time/(.*)", DataTime),
        (r"/static/(.*)", tornado.web.StaticFileHandler, {"path": "./static"})
    ])
    app.listen(args.port)
    print(f"listening on localhost:{args.port}")
    tornado.ioloop.IOLoop.current().start()


if __name__ == '__main__':
    main()
