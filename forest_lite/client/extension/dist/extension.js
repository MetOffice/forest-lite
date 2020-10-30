/*!
 * Copyright (c) 2012 - 2020, Anaconda, Inc., and Bokeh Contributors
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * 
 * Redistributions of source code must retain the above copyright notice,
 * this list of conditions and the following disclaimer.
 * 
 * Redistributions in binary form must reproduce the above copyright notice,
 * this list of conditions and the following disclaimer in the documentation
 * and/or other materials provided with the distribution.
 * 
 * Neither the name of Anaconda nor the names of any contributors
 * may be used to endorse or promote products derived from this software
 * without specific prior written permission.
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF
 * THE POSSIBILITY OF SUCH DAMAGE.
*/
(function(root, factory) {
  factory(root["Bokeh"], undefined);
})(this, function(Bokeh, version) {
  var define;
  return (function(modules, entry, aliases, externals) {
    const bokeh = typeof Bokeh !== "undefined" && (version != null ? Bokeh[version] : Bokeh);
    if (bokeh != null) {
      return bokeh.register_plugin(modules, entry, aliases);
    } else {
      throw new Error("Cannot find Bokeh " + version + ". You have to load it prior to loading plugins.");
    }
  })
({
"e1b43c024c": /* index.js */ function _(require, module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var image_timestamp_1 = require("4f96ca39c4") /* ./image_timestamp */;
    exports.ImageTimestamp = image_timestamp_1.ImageTimestamp;
},
"4f96ca39c4": /* image_timestamp.js */ function _(require, module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    const image_timestamp_base_1 = require("f9514df777") /* ./image_timestamp_base */;
    const color_mapper_1 = require("@bokehjs/models/mappers/color_mapper");
    const linear_color_mapper_1 = require("@bokehjs/models/mappers/linear_color_mapper");
    class ImageView extends image_timestamp_base_1.ImageTimestampBaseView {
        connect_signals() {
            super.connect_signals();
            this.connect(this.model.color_mapper.change, () => this._update_image());
        }
        initialize() {
            super.initialize();
            // Game loop ?
            window.requestAnimationFrame(this._frame);
        }
        _frame(timeStamp) {
            console.log(timeStamp);
        }
        _update_image() {
            // Only reset image_data if already initialized
            if (this.image_data != null) {
                this._set_data(null);
                this.renderer.plot_view.request_render();
            }
        }
        _flat_img_to_buf8(img) {
            const cmap = this.model.color_mapper.rgba_mapper;
            return cmap.v_compute(img);
        }
    }
    exports.ImageView = ImageView;
    ImageView.__name__ = "ImageView";
    // NOTE: this needs to be redefined here, because palettes are located in bokeh-api.js bundle
    const Greys9 = () => ["#000000", "#252525", "#525252", "#737373", "#969696", "#bdbdbd", "#d9d9d9", "#f0f0f0", "#ffffff"];
    class ImageTimestamp extends image_timestamp_base_1.ImageTimestampBase {
        constructor(attrs) {
            super(attrs);
        }
        static init_ImageTimestamp() {
            this.prototype.default_view = ImageView;
            this.define(({ Ref }) => ({
                color_mapper: [Ref(color_mapper_1.ColorMapper), () => new linear_color_mapper_1.LinearColorMapper({ palette: Greys9() })],
            }));
        }
    }
    exports.ImageTimestamp = ImageTimestamp;
    ImageTimestamp.__name__ = "ImageTimestamp";
    ImageTimestamp.init_ImageTimestamp();
},
"f9514df777": /* image_timestamp_base.js */ function _(require, module, exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    const tslib_1 = require("tslib");
    const xy_glyph_1 = require("@bokehjs/models/glyphs/xy_glyph");
    const types_1 = require("@bokehjs/core/types");
    const p = tslib_1.__importStar(require("@bokehjs/core/properties"));
    const selection_1 = require("@bokehjs/models/selections/selection");
    const array_1 = require("@bokehjs/core/util/array");
    const ndarray_1 = require("@bokehjs/core/util/ndarray");
    const assert_1 = require("@bokehjs/core/util/assert");
    class ImageTimestampBaseView extends xy_glyph_1.XYGlyphView {
        constructor(options) {
            super(options);
        }
        connect_signals() {
            super.connect_signals();
            this.connect(this.model.properties.global_alpha.change, () => this.renderer.request_render());
            this.connect(this.model.properties.time_stamp.change, () => {
                // this.renderer.set_data()
                this.renderer.request_render();
            });
        }
        _render(ctx, indices, { image_data, sx, sy, sw, sh }) {
            const old_smoothing = ctx.getImageSmoothingEnabled();
            ctx.setImageSmoothingEnabled(false);
            ctx.globalAlpha = this.model.global_alpha;
            for (const i of indices) {
                if (image_data[i] == null || isNaN(sx[i] + sy[i] + sw[i] + sh[i]))
                    continue;
                const y_offset = sy[i];
                ctx.translate(0, y_offset);
                ctx.scale(1, -1);
                ctx.translate(0, -y_offset);
                ctx.drawImage(image_data[i], sx[i] | 0, sy[i] | 0, sw[i], sh[i]);
                ctx.translate(0, y_offset);
                ctx.scale(1, -1);
                ctx.translate(0, -y_offset);
            }
            ctx.setImageSmoothingEnabled(old_smoothing);
        }
        _set_data(indices) {
            console.log("_set_data");
            this._set_width_heigh_data();
            for (let i = 0, end = this._image.length; i < end; i++) {
                if (indices != null && indices.indexOf(i) < 0)
                    continue;
                const img = this._image[i](this.model.time_stamp);
                let flat_img;
                if (ndarray_1.is_NDArray(img)) {
                    assert_1.assert(img.dimension == 2, "expected a 2D array");
                    flat_img = img;
                    this._height[i] = img.shape[0];
                    this._width[i] = img.shape[1];
                }
                else {
                    flat_img = array_1.concat(img);
                    this._height[i] = img.length;
                    this._width[i] = img[0].length;
                }
                const buf8 = this._flat_img_to_buf8(flat_img);
                this._set_image_data_from_buffer(i, buf8);
            }
        }
        _index_data(index) {
            const { data_size } = this;
            for (let i = 0; i < data_size; i++) {
                const [l, r, t, b] = this._lrtb(i);
                if (isNaN(l + r + t + b) || !isFinite(l + r + t + b))
                    index.add_empty();
                else
                    index.add(l, b, r, t);
            }
        }
        _lrtb(i) {
            const xr = this.renderer.xscale.source_range;
            const x1 = this._x[i];
            const x2 = xr.is_reversed ? x1 - this._dw[i] : x1 + this._dw[i];
            const yr = this.renderer.yscale.source_range;
            const y1 = this._y[i];
            const y2 = yr.is_reversed ? y1 - this._dh[i] : y1 + this._dh[i];
            const [l, r] = x1 < x2 ? [x1, x2] : [x2, x1];
            const [b, t] = y1 < y2 ? [y1, y2] : [y2, y1];
            return [l, r, t, b];
        }
        _set_width_heigh_data() {
            if (this.image_data == null || this.image_data.length != this._image.length)
                this.image_data = new Array(this._image.length);
            if (this._width == null || this._width.length != this._image.length)
                this._width = new types_1.NumberArray(this._image.length);
            if (this._height == null || this._height.length != this._image.length)
                this._height = new types_1.NumberArray(this._image.length);
        }
        _get_or_create_canvas(i) {
            const _image_data = this.image_data[i];
            if (_image_data != null && _image_data.width == this._width[i] &&
                _image_data.height == this._height[i])
                return _image_data;
            else {
                const canvas = document.createElement('canvas');
                canvas.width = this._width[i];
                canvas.height = this._height[i];
                return canvas;
            }
        }
        _set_image_data_from_buffer(i, buf8) {
            const canvas = this._get_or_create_canvas(i);
            const ctx = canvas.getContext('2d');
            const image_data = ctx.getImageData(0, 0, this._width[i], this._height[i]);
            image_data.data.set(buf8);
            ctx.putImageData(image_data, 0, 0);
            this.image_data[i] = canvas;
        }
        _map_data() {
            switch (this.model.properties.dw.units) {
                case "data": {
                    this.sw = this.sdist(this.renderer.xscale, this._x, this._dw, 'edge', this.model.dilate);
                    break;
                }
                case "screen": {
                    this.sw = this._dw;
                    break;
                }
            }
            switch (this.model.properties.dh.units) {
                case "data": {
                    this.sh = this.sdist(this.renderer.yscale, this._y, this._dh, 'edge', this.model.dilate);
                    break;
                }
                case "screen": {
                    this.sh = this._dh;
                    break;
                }
            }
        }
        _image_index(index, x, y) {
            const [l, r, t, b] = this._lrtb(index);
            const width = this._width[index];
            const height = this._height[index];
            const dx = (r - l) / width;
            const dy = (t - b) / height;
            let dim1 = Math.floor((x - l) / dx);
            let dim2 = Math.floor((y - b) / dy);
            if (this.renderer.xscale.source_range.is_reversed)
                dim1 = width - dim1 - 1;
            if (this.renderer.yscale.source_range.is_reversed)
                dim2 = height - dim2 - 1;
            return { index, dim1, dim2, flat_index: dim2 * width + dim1 };
        }
        _hit_point(geometry) {
            const { sx, sy } = geometry;
            const x = this.renderer.xscale.invert(sx);
            const y = this.renderer.yscale.invert(sy);
            const candidates = this.index.indices({ x0: x, x1: x, y0: y, y1: y });
            const result = new selection_1.Selection();
            for (const index of candidates) {
                if (sx != Infinity && sy != Infinity) {
                    result.image_indices.push(this._image_index(index, x, y));
                }
            }
            return result;
        }
    }
    exports.ImageTimestampBaseView = ImageTimestampBaseView;
    ImageTimestampBaseView.__name__ = "ImageTimestampBaseView";
    class ImageTimestampBase extends xy_glyph_1.XYGlyph {
        constructor(attrs) {
            super(attrs);
        }
        static init_ImageTimestampBase() {
            this.define({
                image: [p.NDArraySpec],
                dw: [p.DistanceSpec],
                dh: [p.DistanceSpec],
                dilate: [p.Boolean, false],
                global_alpha: [p.Number, 1.0],
                time_stamp: [p.Number, 1.0],
            });
        }
    }
    exports.ImageTimestampBase = ImageTimestampBase;
    ImageTimestampBase.__name__ = "ImageTimestampBase";
    ImageTimestampBase.init_ImageTimestampBase();
},
}, "e1b43c024c", {"index":"e1b43c024c","image_timestamp":"4f96ca39c4","image_timestamp_base":"f9514df777"}, {});
})

//# sourceMappingURL=extension.js.map
