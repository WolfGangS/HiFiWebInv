/*
HiFiWebInv

Created by Wolfgang
on  30/9/2017

 * @license
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy
 * of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.

*/

(function() {

    var isActive = false;
    var inventory = null;

    var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
    //print(JSON.stringify(Object.keys(tablet)));
    var button = tablet.addButton({
        icon: Script.resolvePath("folder-white.svg"),
        activeIcon: Script.resolvePath("folder-black.svg"),
        text: "Inventory",
        isActive: false,
        sortOrder: 30
    });

    function toggleWebState() {
        setWebState(!isActive);
    }

    function setWebState(on) {
        if (on === isActive) return;
        isActive = on;
        setupWebInv();
        inventory.setVisible(isActive);
        button.editProperties({ isActive: isActive });
    }

    button.clicked.connect(toggleWebState);

    Script.scriptEnding.connect(function() {
        //Controller.mouseReleaseEvent.disconnect(mouseReleaseEvent);
        button.clicked.disconnect(toggleWebState);
        tablet.removeButton(button);
        if(inventory != null){
            inventory.close();
        }
    });

    function setupWebInv() {
        if (inventory == null) {
            inventory = new OverlayWebWindow({
                title: "Inventory",
                source: Script.resolvePath("html/inv.html?" + Date.now()),
                width: 400,
                height: 800,
                visible: false
            });
            inventory.webEventReceived.connect(function(msg) {
                msg = JSON.parse(msg);
            });

            inventory.visibleChanged.connect(function() {
                setWebState(inventory.isVisible());
            });
        }
    }

})();