/* ==========================================================
 * Dropdown.js v2.0.0
 * ==========================================================
 * Copyright 2012 xsokev
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * ========================================================== */

define([
    "./_BootstrapWidget",
    "./List",
    "dojo/_base/declare",
    "dojo/_base/window",
    "dojo/_base/lang",
    "dojo/_base/array",
    "dojo/query",
    "dojo/on",
    "dojo/dom-attr",
    "dojo/dom-class",
    "dijit/registry",
    "dojo/NodeList-traverse"
], function (_BootstrapWidget, ListWidget, declare, win, lang, array, query, on, domAttr, domClass, registry) {

    // module:
    //      Dropdown

    var _Dropdown = declare("Dropdown", [_BootstrapWidget], {
        // summary:
        //      Adds dropdown support to elements.
        // description:
        //      Handles the visibility of the dropdown. Provides events for dropdown list
        //      item selection.
        //
        //      ## Events ##
        //		Call `widget.on("select", func)` to monitor when a dropdown list item is
        //      selected. Returns event.selectedItem.
        //
        // example:
        // |        <span id="dd1" class="dropdown" data-dojo-type="bootstrap/Dropdown">
        // |            <a class="dropdown-toggle" href="#">Dropdown <b class="caret"></b></a>
        // |            <ul class="dropdown-menu" role="menu">
        // |                <li><a href="http://google.com">one</a></li>
        // |                <li><a href="#">two</a></li>
        // |                <li><a href="#">three</a></li>
        // |            </ul>
        // |        </span>
        // example:
        // |        <span id="dd1" class="dropdown">
        // |            <a class="dropdown-toggle" href="#">Dropdown <b class="caret"></b></a>
        // |            <ul class="dropdown-menu" role="menu">
        // |                <li><a href="http://google.com">one</a></li>
        // |                <li><a href="#">two</a></li>
        // |                <li><a href="#">three</a></li>
        // |            </ul>
        // |        </span>
        // |
        // |    require(["dojo/query"], function(query) {
        // |        new Dropdown({
        // |           preventDefault: false,
        // |           selectable: true,
        // |           selectFirstOnOpen: false
        // |        }, query("#dd1")[0]);
        // |    });

        // preventDefault: Boolean
        //          prevent default actions when list items are clicked
        preventDefault: false,
        selectable: true,
        selectFirstOnOpen: false,

        postCreate: function () {
            // summary:
            //      initializes events needed to display dropdown element. Also initializes list handler.
            // tags:
            //		private extension
            this.toggleNode = query(".dropdown-toggle", this.domNode)[0];
            if (this.toggleNode) {
                this.own(on(this.toggleNode, "click, touchstart", lang.hitch(this, "toggle")));
            }
            this.listNode = query(".dropdown-menu", this.domNode)[0];
            if (this.listNode) {
                this.list = new ListWidget({
                    selectable: this.selectable,
                    preventDefault: this.preventDefault
                }, this.listNode);
                this.own(
                    on(this.list, 'list-select', lang.hitch(this, "_select")),
                    on(this.list, 'list-escape', lang.hitch(this, "close"))
                );
            }
            this.own(on(this.domNode, on.selector("form", "click, touchstart"), function (e) {
                e.stopPropagation();
            }));
            this._bodyClickEvent = on(document, 'click', lang.hitch(this, this._clearDropdowns));
            this.shown = false;
        },

        _setSelectableAttr: function (selectable) {
            if (this.list) {
                this.list.selectable = selectable;
            }
        },

        _getSelectableAttr: function () {
            return this.list.selectable;
        },

        _setPreventDefault: function (preventDefault) {
            if (this.list) {
                this.list.preventDefault = preventDefault;
            }
        },

        _getPreventDefault: function () {
            return this.list.preventDefault;
        },

        _setSelectFirstOnOpen: function (selectFirstOnOpen) {
            this.selectFirstOnOpen = selectFirstOnOpen;
        },

        _getSelectFirstOnOpen: function () {
            return this.selectFirstOnOpen;
        },

        toggle: function (e) {
            // summary:
            //      toggles the display of the dropdown
            if (this.isDisabled()) {
                return false;
            }
            this.isOpen() ? this.close() : this.open();
            if (e) {
                e.preventDefault();
                e.stopPropagation();
            }
            return this;
        },

        open: function () {
            // summary:
            //      shows the dropdown. Hides any other displayed dropdowns on the page.
            if (this.isDisabled()) {
                return false;
            }
            this._clearDropdowns();
            this.isOpen() || domClass.add(this.domNode, 'open');
            if (this.selectFirstOnOpen) {
                this.list._first();
            }
            this.shown = true;
            this.list.domNode.focus();
        },

        close: function () {
            // summary:
            //      hides the dropdown.
            if (this.isDisabled()) {
                return false;
            }
            this.isOpen() && domClass.remove(this.domNode, 'open');
            this.shown = false;
        },

        isDisabled: function () {
            // summary:
            //      returns whether the dropdown is currently disabled.
            return domClass.contains(this.domNode, "disabled") || domAttr.get(this.domNode, "disabled"); //Boolean
        },

        isOpen: function () {
            // summary:
            //      returns whether the dropdown is currently visible.
            return this.shown;
        },

        _clearDropdowns: function () {
            array.forEach(this._getDropdowns(), function (dropdown) {
                dropdown.close();
            });
        },
        _getDropdowns: function () {
            var allWidgets = registry.findWidgets(document.body);
            return array.filter(allWidgets, function (widget) {
                return widget instanceof _Dropdown;
            });
        },
        _select: function (e) {
            var li = e.selected;
            this.close();
            this.emit("select", {
                selectedItem: li
            });
        }
    });

    return _Dropdown;
});
