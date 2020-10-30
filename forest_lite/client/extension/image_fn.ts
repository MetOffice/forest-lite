import {ImageFnBase, ImageFnBaseView, ImageDataBase} from "./image_fn_base"
import {ColorMapper} from "@bokeh/bokehjs/build/js/lib/models/mappers/color_mapper"
import {LinearColorMapper} from "@bokeh/bokehjs/build/js/lib/models/mappers/linear_color_mapper"
import {Arrayable} from "@bokeh/bokehjs/build/js/lib/core/types"
import * as p from "@bokeh/bokehjs/build/js/lib/core/properties"

export interface ImageData extends ImageDataBase {}

export interface ImageView extends ImageData {}

export class ImageView extends ImageFnBaseView {
  model: ImageFn
  visuals: ImageFn.Visuals

  connect_signals(): void {
    super.connect_signals()
    this.connect(this.model.color_mapper.change, () => this._update_image())
    this.connect(this.model.properties.parameter.change, () => this.renderer.request_render())
  }

  protected _update_image(): void {
    // Only reset image_data if already initialized
    if (this.image_data != null) {
      this._set_data(null)
      this.renderer.plot_view.request_render()
    }
  }

  protected _flat_img_to_buf8(img: Arrayable<number>): Uint8Array {
    const cmap = this.model.color_mapper.rgba_mapper
    return cmap.v_compute(img)
  }
}

// NOTE: this needs to be redefined here, because palettes are located in bokeh-api.js bundle
const Greys9 = () => ["#000000", "#252525", "#525252", "#737373", "#969696", "#bdbdbd", "#d9d9d9", "#f0f0f0", "#ffffff"]

export namespace ImageFn {
  export type Attrs = p.AttrsOf<Props>

  export type Props = ImageFnBase.Props & {
    color_mapper: p.Property<ColorMapper>
    parameter: p.Property<number>
  }

  export type Visuals = ImageFnBase.Visuals
}

export interface ImageFn extends ImageFn.Attrs {}

export class ImageFn extends ImageFnBase {
  properties: ImageFn.Props
  __view_type__: ImageView

  constructor(attrs?: Partial<ImageFn.Attrs>) {
    super(attrs)
  }

  static init_ImageFn(): void {
    this.prototype.default_view = ImageView

    this.define<ImageFn.Props>({
      color_mapper: [ p.Instance, () => new LinearColorMapper({palette: Greys9()}) ],
      parameter: [ p.Number,    1.0   ],
    })
  }
}
ImageFn.__name__ = "ImageFn";
ImageFn.init_ImageFn();
