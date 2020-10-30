import {
    ImageTimestampBase,
    ImageTimestampBaseView,
    ImageDataTimestampBase
} from "./image_timestamp_base"
import {ColorMapper} from "@bokehjs/models/mappers/color_mapper"
import {LinearColorMapper} from "@bokehjs/models/mappers/linear_color_mapper"
import {Arrayable} from "@bokehjs/core/types"
import * as p from "@bokehjs/core/properties"

export interface ImageData extends ImageDataTimestampBase {}

export interface ImageView extends ImageData {}

export class ImageView extends ImageTimestampBaseView {
  model: ImageTimestamp
  visuals: ImageTimestamp.Visuals

  connect_signals(): void {
    super.connect_signals()
    this.connect(this.model.color_mapper.change, () => this._update_image())
  }

  initialize(): void {
      super.initialize()

      // Game loop ?
      window.requestAnimationFrame(this._frame)
  }

  _frame(timeStamp: number): void {
      console.log(timeStamp)
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

export namespace ImageTimestamp {
  export type Attrs = p.AttrsOf<Props>

  export type Props = ImageTimestampBase.Props & {
    color_mapper: p.Property<ColorMapper>
  }

  export type Visuals = ImageTimestampBase.Visuals
}

export interface ImageTimestamp extends ImageTimestamp.Attrs {}

export class ImageTimestamp extends ImageTimestampBase {
  properties: ImageTimestamp.Props
  __view_type__: ImageView

  constructor(attrs?: Partial<ImageTimestamp.Attrs>) {
    super(attrs)
  }

  static init_ImageTimestamp(): void {
    this.prototype.default_view = ImageView

    this.define<ImageTimestamp.Props>(({Ref}) => ({
      color_mapper: [ Ref(ColorMapper), () => new LinearColorMapper({palette: Greys9()}) ],
    }))
  }
}
