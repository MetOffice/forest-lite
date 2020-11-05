import { ImageBase, ImageBaseView, ImageDataBase } from "@bokeh/bokehjs/build/js/lib/models/glyphs/image_base";
import { ColorMapper } from "@bokeh/bokehjs/build/js/lib/models/mappers/color_mapper";
import { Arrayable } from "@bokeh/bokehjs/build/js/lib/core/types";
import * as p from "@bokeh/bokehjs/build/js/lib/core/properties";
export interface ImageData extends ImageDataBase {
    _fn: Function[];
}
export interface ImageView extends ImageData {
}
export declare class ImageView extends ImageBaseView {
    model: ImageFn;
    visuals: ImageFn.Visuals;
    connect_signals(): void;
    protected _set_data(indices: number[] | null): void;
    protected _update_image(): void;
    protected _flat_img_to_buf8(img: Arrayable<number>): Uint8Array;
}
export declare namespace ImageFn {
    type Attrs = p.AttrsOf<Props>;
    type Props = ImageBase.Props & {
        color_mapper: p.Property<ColorMapper>;
        parameter: p.Property<number>;
        fn: p.NumberSpec;
    };
    type Visuals = ImageBase.Visuals;
}
export interface ImageFn extends ImageFn.Attrs {
}
export declare class ImageFn extends ImageBase {
    properties: ImageFn.Props;
    __view_type__: ImageView;
    constructor(attrs?: Partial<ImageFn.Attrs>);
    static init_ImageFn(): void;
}
