/* 
 * Copyright (c) 2014 Gloey Apps
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * 
 * @author: Hein Rutjes (IjzerenHein)
 * @license MIT
 * @copyright Gloey Apps, 2014
 */

/*jslint browser:true, nomen:true, vars:true, plusplus:true*/
/*global define*/

/**
 * @title MapStateModifier
 * 
 * The MapStateModifier makes it possible to link renderables to a geopgraphical position on a `MapView`.
 * Additionally it adds functionality for rotating and zooming renderables, and possibly all kinds of future 
 * map-related transformations.
 *
 * The MapStateModifier makes it possible to use transitions to e.g. move a renderable from one geographical
 * position to another. If the renderable doesn't require transitions, the use of the lightweight 
 * and stateless `MapModifier` is strongly preferred.
 *
 * ### Options
 *
 * **mapView**: {MapView} The MapView.
 *
 * **[position]**: {LatLng} Initial geographical coordinates.
 *
 * **[offset]**: {LatLng} Displacement offset in geographical coordinates from the position.
 *
 * **[rotateTowards]**: {LatLng} Position to rotate the renderables towards.
 *
 * **[zoomBase]**: {Number} Base zoom-level at which the renderables are displayed in their true size.
 *
 * **[zoomScale]**: {Number, Function} Customer zoom-scaling factor or function.
 */
define(function (require, exports, module) {
    'use strict';

    // import dependencies
    var MapModifier = require('./MapModifier');
    var MapPositionTransitionable = require('./MapPositionTransitionable');

    /**
     * @class MapModifier
     *
     * @method constructor
     * @constructor
     * @param {Object} options Options.
     */
    function MapStateModifier(options) {
        this.mapView = options.mapView;
        this._positionState = new MapPositionTransitionable(options.position);
        this._rotateTowardsState = new MapPositionTransitionable(options.rotateTowards);
        
        this._modifier = new MapModifier({
            mapView: this.mapView
        });
        
        if (options.position) { this.setPosition(options.position); }
        if (options.rotateTowards) { this.rotateTowards(options.rotateTowards); }
        if (options.offset) { this.setOffset(options.offset); }
        if (options.zoomBase) { this.setZoomBase(options.zoomBase); }
        if (options.zoomScale) { this.setZoomBase(options.zoomScale); }
    }

    /**
     * Set the geographical position of the renderables, by adding the new position to the chain of transitions.
     *
     * @method setPosition
     * @param {LatLng} position New position in geographical coordinates (Latitude, Longitude).
     * @param {Transition} [transition] Famo.us transitionable object.
     * @param {Function} [callback] callback to call after transition completes.
     */
    MapStateModifier.prototype.setPosition = function (position, transition, callback) {
        this._positionState.set(position, transition, callback);
        return this;
    };
    
    /**
     * Set the destination geographical position to rotate the renderables towards, by adding them.
     * to the chain of transitions.
     * The child renderables are assumed to be rotated to the right by default.
     * To change the base rotation, add a rotation-transform to the renderable, like this: 
     * `new Modifier({transform: Transform.rotateZ(Math.PI/2)})`
     *
     * @method rotateTowards
     * @param {LatLng} position Destination position in geographical position to rotate towards.
     * @param {Transition} [transition] Famo.us transitionable object.
     * @param {Function} [callback] callback to call after transition completes.
     */
    MapStateModifier.prototype.rotateTowards = function (position, transition, callback) {
        this._rotateTowardsState.set(position, transition, callback);
    };
    
    /**
     * Set the base zoom-level. When set, auto-zooming is effecitvely enabled.
     * The renderables are then displayed in their true size when the map zoom-level equals zoomBase.
     *
     * @method setZoomBase
     * @param {Number} zoomBase Map zoom-level
     */
    MapStateModifier.prototype.setZoomBase = function (zoomBase) {
        this._modifier.setZoomBase(zoomBase);
        return this;
    };
    
    /**
     * Set the zoom-scale (ignored when zoomBase is not set). When set, the scale is increased when zooming in and 
     * decreased when zooming-out. The zoomScale can be either a Number or a Function which returns
     * a scale-factor, with the following signature: function (zoomBase, zoomCurrent).
     *
     * @method setZoomScale
     * @param {Number,Function} zoomScale Zoom-scale factor or function.
     */
    MapStateModifier.prototype.setZoomScale = function (zoomScale) {
        this._modifier.setZoomScale(zoomScale);
        return this;
    };
    
    /**
     * Set the displacement offset in geographical coordinates.
     *
     * @method setOffset
     * @param {LatLng} offset Displacement offset in geographical coordinates.
     */
    MapStateModifier.prototype.setOffset = function (offset) {
        this._modifier.setOffset(offset);
        return this;
    };
        
    /**
     * Get the current geographical position.
     *
     * @method getPosition
     * @return {LatLng} Position in geographical coordinates.
     */
    MapStateModifier.prototype.getPosition = function () {
        return this._positionState.get();
    };
    
    /**
     * Get the geographical position towards which the renderables are currently rotated.
     *
     * @method getRotateTowards
     * @return {LatLng} Destination geographical position towards which renderables are rotated.
     */
    MapStateModifier.prototype.getRotateTowards = function () {
        return this._rotateTowardsState.get();
    };
     
    /**
     * Get the destination geographical position.
     *
     * @method getFinalPosition
     * @return {LatLng} Position in geographical coordinates.
     */
    MapStateModifier.prototype.getFinalPosition = function () {
        return this._positionState.getFinal();
    };
    
    /**
     * Get the destination geographical position which the renderables should be rotated towards.
     *
     * @method getFinalRotateTowards
     * @return {LatLng} Position in geographical coordinates.
     */
    MapStateModifier.prototype.getFinalRotateTowards = function () {
        return this._rotateTowardsState.getFinal();
    };
    
    /**
     * Get the base zoom-level. The zoomBase indicates the zoom-level at which renderables are
     * displayed in their true size.
     *
     * @method getZoomBase
     * @return {Number} Base zoom level
     */
    MapStateModifier.prototype.getZoomBase = function () {
        return this._modifier.getZoomBase();
    };
    
    /**
     * Get the base zoom-scale. The zoomScale can be either a Number or a Function which returns
     * a scale-factor.
     *
     * @method getZoomScale
     * @return {Number, Function} Zoom-scale
     */
    MapStateModifier.prototype.getZoomScale = function () {
        return this._modifier.getZoomScale();
    };
    
     /**
     * Get the geographical displacement offset.
     *
     * @method getOffset
     * @return {LatLng} Offset in geographical coordinates.
     */
    MapStateModifier.prototype.getOffset = function () {
        return this._modifier.getOffset();
    };
    
    /**
     * Halts any pending transitions.
     *
     * @method halt
     */
    MapStateModifier.prototype.halt = function () {
        this._positionState.halt();
        this._rotateTowardsState.halt();
    };

    /**
     * Is there at least one transition pending completion?
     *
     * @method isActive
     * @return {Bool} True when there are active transitions running.
     */
    MapStateModifier.prototype.isActive = function () {
        return this._positionState.isActive() || this._rotateTowardsState.isActive();
    };

    /**
     * Return render spec for this StateModifier, applying to the provided
     *    target component.  This is similar to render() for Surfaces.
     *
     * @method modify
     * @private
     * @ignore
     *
     * @param {Object} target (already rendered) render spec to
     *    which to apply the transform.
     * @return {Object} render spec for this StateModifier, including the
     *    provided target
     */
    MapStateModifier.prototype.modify = function modify(target) {
        this._modifier.positionFrom(this._positionState.get());
        this._modifier.rotateTowardsFrom(this._rotateTowardsState.get());
        return this._modifier.modify(target);
    };
    
    module.exports = MapStateModifier;
});
