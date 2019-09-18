import * as React from "react";

import { connect } from 'react-redux';
import { ImageEditorStore } from './store/imageReducer';
import { dispatchChangeImageDimensions, dispatchUndoImageEdit, dispatchRedoImageEdit, dispatchToggleAspectRatioLocked, dispatchChangeZoom, dispatchToggleOnionSkinEnabled} from './actions/dispatch';
import { IconButton } from "./Button";

export interface BottomBarProps {
    dispatchChangeImageDimensions: (dimensions: [number, number]) => void;
    dispatchChangeZoom: (zoomDelta: number) => void;
    imageDimensions: [number, number];
    cursorLocation: [number, number];

    hasUndo: boolean;
    hasRedo: boolean;

    aspectRatioLocked: boolean;
    onionSkinEnabled: boolean;

    dispatchUndoImageEdit: () => void;
    dispatchRedoImageEdit: () => void;
    dispatchToggleAspectRatioLocked: () => void;
    dispatchToggleOnionSkinEnabled: () => void;
}

export interface BottomBarState {
    width?: string;
    height?: string;
}

export class BottomBarImpl extends React.Component<BottomBarProps, BottomBarState> {
    constructor(props: BottomBarProps) {
        super(props);
        this.state = {};
    }

    render() {
        const {
            imageDimensions,
            cursorLocation,
            hasUndo,
            hasRedo,
            dispatchUndoImageEdit,
            dispatchRedoImageEdit,
            aspectRatioLocked,
            onionSkinEnabled,
            dispatchToggleAspectRatioLocked,
            dispatchToggleOnionSkinEnabled,
            dispatchChangeZoom
        } = this.props;

        const width = this.state.width == null ? imageDimensions[0] : this.state.width;
        const height = this.state.height == null ? imageDimensions[1] : this.state.height;

        return (
            <div className="image-editor-bottombar">
                <div className="image-editor-resize">
                    <input className="image-editor-input"
                        title="Image Width"
                        value={width}
                        onChange={this.handleWidthChange}
                        onBlur={this.handleDimensionalBlur}
                    />

                    <IconButton
                        onClick={dispatchToggleAspectRatioLocked}
                        iconClass={aspectRatioLocked ? "ms-Icon ms-Icon--Lock" : "ms-Icon ms-Icon--Unlock"}
                        title={aspectRatioLocked ? "Unlock Apect Ratio" : "Lock Aspect Ratio"}
                        toggle={!aspectRatioLocked}
                    />

                    <input className="image-editor-input"
                        title="Image Height"
                        value={height}
                        onChange={this.handleHeightChange}
                        onBlur={this.handleDimensionalBlur}
                    />
                </div>
                <div className="image-editor-seperator"/>
                <div className="image-editor-zoom-controls">
                    <IconButton
                        onClick={() => dispatchChangeZoom(1)}
                        iconClass="ms-Icon ms-Icon--ZoomIn"
                        title="Zoom In"
                        toggle={true}
                    />
                    <IconButton
                        onClick={() => dispatchChangeZoom(-1)}
                        iconClass="ms-Icon ms-Icon--ZoomOut"
                        title="Zoom Out"
                        toggle={true}
                    />
                </div>
                <div className="image-editor-seperator"/>
                <div>
                    <IconButton
                        onClick={dispatchToggleOnionSkinEnabled}
                        iconClass="ms-Icon ms-Icon--MapLayers"
                        title={onionSkinEnabled ? "Hide Previous Frame" : "Show Previous Frame"}
                        toggle={!onionSkinEnabled}
                    />
                </div>
                <div className="image-editor-coordinate-preview">
                    {cursorLocation && `${cursorLocation[0]}, ${cursorLocation[1]}`}
                </div>
                <div className="image-editor-undo-redo">
                    <IconButton
                        title="Undo"
                        iconClass="ms-Icon ms-Icon--Undo"
                        onClick={hasUndo ? dispatchUndoImageEdit : null}
                        disabled={!hasUndo}
                    />
                    <IconButton
                        title="Redo"
                        iconClass="ms-Icon ms-Icon--Redo"
                        onClick={hasRedo ? dispatchRedoImageEdit : null}
                        disabled={!hasRedo}
                    />
                </div>
            </div>
        );
    }

    protected handleWidthChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        const value = parseInt(text);

        const { aspectRatioLocked, imageDimensions } = this.props;

        if (!isNaN(value) && aspectRatioLocked) {
            this.setState({
                width: value + "",
                height: Math.floor(value * (imageDimensions[1] / imageDimensions[0])) + ""
            })
        }
        else {
            this.setState({ width: text });
        }
    }

    protected handleHeightChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const text = event.target.value;
        const value = parseInt(text);

        const { aspectRatioLocked, imageDimensions } = this.props;

        if (!isNaN(value) && aspectRatioLocked) {
            this.setState({
                height: value + "",
                width: Math.floor(value * (imageDimensions[0] / imageDimensions[1])) + ""
            })
        }
        else {
            this.setState({ height: text });
        }
    }

    protected handleDimensionalBlur = () => {
        const { imageDimensions, dispatchChangeImageDimensions } = this.props;

        const widthVal = parseInt(this.state.width);
        const heightVal = parseInt(this.state.height);

        const width = isNaN(widthVal) ? imageDimensions[0] : Math.min(Math.max(widthVal, 1), 999);
        const height = isNaN(heightVal) ? imageDimensions[1] : Math.min(Math.max(heightVal, 1), 999);

        if (width !== imageDimensions[0] || height !== imageDimensions[1]) {
            dispatchChangeImageDimensions([width, height]);
        }

        this.setState({
            width: null,
            height: null
        });
    }
}

function mapStateToProps({ present: state, past, future, editor }: ImageEditorStore, ownProps: any) {
    if (!state) return {};

    const bitmap = state.frames[state.currentFrame].bitmap;

    return {
        imageDimensions: [ bitmap.width, bitmap.height ],
        aspectRatioLocked: state.aspectRatioLocked,
        onionSkinEnabled: editor.onionSkinEnabled,
        cursorLocation: editor.cursorLocation,
        hasUndo: !!past.length,
        hasRedo: !!future.length
    };
}

const mapDispatchToProps = {
    dispatchChangeImageDimensions,
    dispatchUndoImageEdit,
    dispatchRedoImageEdit,
    dispatchToggleAspectRatioLocked,
    dispatchToggleOnionSkinEnabled,
    dispatchChangeZoom
};


export const BottomBar = connect(mapStateToProps, mapDispatchToProps)(BottomBarImpl);