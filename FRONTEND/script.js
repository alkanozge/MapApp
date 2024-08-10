const rasterLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
});

const vectorSource = new ol.source.Vector();
const vectorLayer = new ol.layer.Vector({
    source: vectorSource,
});

const map = new ol.Map({
    target: 'map',
    layers: [rasterLayer, vectorLayer],
    view: new ol.View({
        center: ol.proj.fromLonLat([35.2433, 38.9637]), //Centering on Turkey
        zoom: 6,
    }),
});

const wktFormat = new ol.format.WKT();

async function fetchAndDisplayGeometries() {
    try {
        const response = await fetch('https://localhost:7058/api/Geometry');
        const data = await response.json();

        const features = data.value.map(item => {
            const feature = wktFormat.readFeature(item.wkt, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857',
            });
            feature.setId(item.id);
            feature.setProperties({ name: item.name, wkt: item.wkt });
            return feature;
        });

        vectorSource.clear();  
        vectorSource.addFeatures(features);

        //to see the numbers
        /*
        const pointCount = features.filter(feature => feature.getGeometry().getType() === 'Point').length;
        const polygonCount = features.filter(feature => feature.getGeometry().getType() === 'Polygon').length;
        console.log(`Number of Points: ${pointCount}`);
        console.log(`Number of Polygons: ${polygonCount}`);
        */

        const styleFunction = function (feature) {
            const geometryType = feature.getGeometry().getType();
            if (geometryType === 'Point') {
                return new ol.style.Style({
                    image: new ol.style.Icon({
                        src: '2991231.png',
                        scale: 0.12
                    })
                });
            } else if (geometryType === 'Polygon') {
                return new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(35, 120, 144, 0.39)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#839BCA',
                        width: 1.6
                    })
                });
            }
        };

        vectorLayer.setStyle(styleFunction);
    } catch (error) {
        console.error('Error fetching geometries:', error);
    }
}

fetchAndDisplayGeometries();

/*
const transformedCoordinates = ol.proj.transform(
    [3857733.7339493884, 5042767.613481618], //Example
    'EPSG:3857', //Source
    'EPSG:4326'  //Destination
);
console.log('Transformed Coordinates:', transformedCoordinates);
*/



function createPopup(feature) {
    const wkt = feature.get('wkt') || 'WKT not available';
    const name = feature.get('name') || 'Name not available';
    const id = feature.getId();


    if (id === undefined) {
      console.error('Feature ID is undefined');
      return;
    }

    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Feature Details',
        contentSize: '400 300',
        content: `
            <div class="popup-content">
                <p><strong>WKT:</strong> ${wkt}</p>
                <p><strong>Name:</strong> ${name}</p>
                <div class="popup-buttons">
                    <button id="updateBtn">Update</button>
                    <button id="deleteBtn">Delete</button>
                </div>
            </div>
        `,
        callback: function (panel) {
            panel.content.style.padding = '0';  
            panel.header.style.backgroundColor = '#768AB8';
            document.getElementById('updateBtn').addEventListener('click', function () {
                panel.close();
                openUpdatePanel(feature, id, name, wkt);
            });

            document.getElementById('deleteBtn').addEventListener('click', async function () {
                try {
                    const response = await fetch(`https://localhost:7058/api/Geometry/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        toastr.success('Feature deleted successfully!');
                        panel.close();
                        fetchAndDisplayGeometries();
                    } else {
                        const errorData = await response.json();
                        toastr.error(`Failed to delete feature: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('Error deleting feature:', error);
                    toastr.error('Failed to delete feature. Please try again.');
                }
            });
        }
    });
}

map.on('singleclick', function (evt) {
    map.forEachFeatureAtPixel(evt.pixel, function (feature) {
        createPopup(feature);
    });
});


function openUpdatePanel(feature, id, name, wkt) {
    let dragLayer, dragInteraction;

    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Update Feature',
        contentSize: '400 300',
        content: `
            <form id="updateFeatureForm">
                <label for="updateFeatureName">Name:</label>
                <input type="text" id="updateFeatureName" value="${name}"><br>
                <label for="updateFeatureWKT">WKT :</label>
                <textarea id="updateFeatureWKT" rows="4">${wkt}</textarea><br>
                <div class="update-panel-buttons">
                    <button type="button" id="updateSaveBtn">Save</button>
                    <button type="button" id="dragBtn">Update by Dragging</button>
                </div>
            </form>
        `,
        callback: function (updatePanel) {
            updatePanel.header.classList.add('update-panel-header');
            updatePanel.content.style.padding = '20px'; 

            const isPolygon = feature.getGeometry().getType() === 'Polygon';
            const isPoint = feature.getGeometry().getType() === 'Point';

            document.getElementById('updateSaveBtn').addEventListener('click', async function () {
                const newName = document.getElementById('updateFeatureName').value;
                const newWKT = document.getElementById('updateFeatureWKT').value;

                if (newName.trim() === '' || newWKT.trim() === '') {
                    toastr.warning('Please enter a name or WKT for the feature.');
                    return;
                }

                const updatedFeature = {
                    id: id,
                    name: newName,
                    wkt: newWKT
                };

                try {
                    const response = await fetch(`https://localhost:7058/api/Geometry/${id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(updatedFeature)
                    });

                    if (response.ok) {
                        toastr.success('Feature updated successfully!');
                        updatePanel.close();
                        fetchAndDisplayGeometries();
                    } else {
                        const errorData = await response.json();
                        toastr.error(`Failed to update feature: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('Error updating feature:', error);
                    toastr.error('Failed to update feature. Please try again.');
                }

                if (dragInteraction) {
                    map.removeLayer(dragLayer);
                    map.removeInteraction(dragInteraction);
                }

            });

            document.getElementById('dragBtn').addEventListener('click', function () {
                const dragSource = new ol.source.Vector({ features: [feature] });
                dragLayer = new ol.layer.Vector({ source: dragSource });
                dragInteraction = new ol.interaction.Modify({ source: dragSource });

                map.addLayer(dragLayer);
                map.addInteraction(dragInteraction);

                const extent = feature.getGeometry().getExtent();
                map.getView().fit(extent, { duration: 1000 });

                let isDragging = false;

                dragInteraction.on('modifyend', async function (event) {
                    if (!isDragging) {
                        isDragging = true;
                        const newGeometry = event.features.item(0).getGeometry();
                        const newCoordinates = newGeometry.getCoordinates();

                        let updatedWKT;
                        if (newGeometry.getType() === 'Point') {
                            const [newLon, newLat] = ol.proj.toLonLat(newCoordinates);
                            updatedWKT = `POINT(${newLon} ${newLat})`;

                            const updatedFeature = {
                                id: id,
                                name: document.getElementById('updateFeatureName').value,
                                wkt: updatedWKT
                            };

                            try {
                                const response = await fetch(`https://localhost:7058/api/Geometry/${id}`, {
                                    method: 'PUT',
                                    headers: {
                                        'Content-Type': 'application/json'
                                    },
                                    body: JSON.stringify(updatedFeature)
                                });

                                if (response.ok) {
                                    toastr.success('Feature updated successfully!');
                                    updatePanel.close();
                                    fetchAndDisplayGeometries();
                                } else {
                                    const errorData = await response.json();
                                    toastr.error(`Failed to update feature: ${errorData.message}`);
                                }
                            } catch (error) {
                                console.error('Error updating feature:', error);
                                toastr.error('Failed to update feature. Please try again.');
                            }

                            map.removeLayer(dragLayer);
                            map.removeInteraction(dragInteraction);
                        } else if (newGeometry.getType() === 'Polygon') {
                            const polygonCoordinates = newCoordinates[0].map(coord => ol.proj.toLonLat(coord));
                            updatedWKT = `POLYGON((${polygonCoordinates.map(coord => `${coord[0]} ${coord[1]}`).join(', ')}))`;
                            document.getElementById('updateFeatureWKT').value = updatedWKT;

                            //Allowing further dragging for polygons
                            isDragging = false;
                        }
                    }
                });


            });

        }
    });
}


document.getElementById('btn2').addEventListener('click', async function () {
    try {
        const response = await fetch('https://localhost:7058/api/Geometry');
        const data = await response.json();

        if (data.success) {
            const geometries = data.value;

            const panelContent = `
                <div>
                    <table id="featureTable" class="display" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>WKT</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${geometries.map(geometry => `
                                <tr>
                                    <td>${geometry.name}</td>
                                    <td>${geometry.wkt}</td>
                                    <td>
                                        <button class="query-button showBtn" data-id="${geometry.id}">Show</button>
                                        <button class="query-button updateBtn" data-id="${geometry.id}">Update</button>
                                        <button class="query-button deleteBtn" data-id="${geometry.id}">Delete</button>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;

            const queryPanel = jsPanel.create({
                theme: 'primary',
                headerTitle: 'Query',
                contentSize: '700 500',
                content: panelContent,
                callback: function (panel) {
                    panel.header.style.backgroundColor = '#768AB8';

                    $('#featureTable').DataTable({
                        paging: true,
                        searching: true,
                        ordering: true,
                        info: true,
                        lengthChange: false,
                        language: {
                            search: "Filter records:",
                            paginate: {
                                next: "Next",
                                previous: "Previous"
                            }
                        }
                    });

                    //event delegation for dynamic elements
                    panel.content.addEventListener('click', async function (event) {
                        const target = event.target;
                        if (target.classList.contains('showBtn')) {
                            const id = target.getAttribute('data-id');
                            const feature = vectorSource.getFeatureById(id);
                            if (feature) {
                                panel.close();
                                map.getView().fit(feature.getGeometry().getExtent(), { duration: 1000 });
                            } else {
                                toastr.error('Feature not found on the map.');
                            }
                        } else if (target.classList.contains('updateBtn')) {
                            const id = target.getAttribute('data-id');
                            const feature = vectorSource.getFeatureById(id);
                            if (feature) {
                                openUpdatePanel(feature, id, feature.get('name'), feature.get('wkt'));
                                panel.close();
                            } else {
                                toastr.error('Feature not found on the map.');
                            }
                        } else if (target.classList.contains('deleteBtn')) {
                            const id = target.getAttribute('data-id');
                            try {
                                const response = await fetch(`https://localhost:7058/api/Geometry/${id}`, {
                                    method: 'DELETE'
                                });

                                if (response.ok) {
                                    toastr.success('Feature deleted successfully!');
                                    fetchAndDisplayGeometries();
                                    panel.close();
                                } else {
                                    const errorData = await response.json();
                                    toastr.error(`Failed to delete feature: ${errorData.message}`);
                                }
                            } catch (error) {
                                console.error('Error deleting feature:', error);
                                toastr.error('Failed to delete feature. Please try again.');
                            }
                        }
                    });
                }
            });
        } else {
            toastr.error(`Error fetching geometries: ${data.message}`);
        }
    } catch (error) {
        console.error('Error fetching geometries:', error);
        toastr.error('Failed to fetch geometries. Please try again.');
    }
});


const drawPoint = new ol.interaction.Draw({
    source: vectorSource,
    //source: new ol.source.Vector({ wrapX: false }),
    type: 'Point',
});

const drawPolygon = new ol.interaction.Draw({
    source: vectorSource,
    type: 'Polygon',
});

/*
const modify = new ol.interaction.Modify({ source: vectorSource });
const snap = new ol.interaction.Snap({ source: vectorSource });
map.addInteraction(modify);
map.addInteraction(snap);
*/  

document.getElementById('btn1').addEventListener('click', function () {

    map.addInteraction(drawPoint);
    map.removeInteraction(drawPolygon);

});

document.getElementById('btn3').addEventListener('click', function () {

    map.addInteraction(drawPolygon);
    map.removeInteraction(drawPoint);


});

drawPoint.on('drawend', function (evt) {
    const feature = evt.feature;
    createFeaturePanel(feature, 'Point');

});

drawPolygon.on('drawend', function (evt) {
    const feature = evt.feature;
    createFeaturePanel(feature, 'Polygon');
});


function createFeaturePanel(feature, type) {
    const wktFormat = new ol.format.WKT();

    const wkt = wktFormat.writeFeature(feature, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857',
    });

    console.log('New Feature WKT:', wkt);

    jsPanel.create({
        theme: 'primary',
        headerTitle: 'Add New Feature',
        contentSize: '400 300',
        content: `
            <form id="featureForm" class="panel-content">
                <label for="featureName">Name:</label>
                <input type="text" id="featureName" placeholder="Enter name"><br>
                <label for="featureWKT">WKT:</label>
                <textarea id="featureWKT" rows="4" readonly>${wkt}</textarea><br>
                <div class="button-container">
                    <button type="button" id="saveFeatureBtn">Save</button>
                    <button type="button" id="cancelFeatureBtn">Cancel</button>
                </div>
            </form>
        `,
        callback: function (panel) {
            panel.content.style.padding = '0';  
            panel.header.style.backgroundColor = '#768AB8';

            const closePanel = () => {
                panel.close();
                map.removeInteraction(drawPoint);
                map.removeInteraction(drawPolygon);
            };

            document.getElementById('saveFeatureBtn').addEventListener('click', async function () {
                const name = document.getElementById('featureName').value;

                if (name === '') {
                    toastr.warning('Feature name is missing.');
                    return;
                }

                const newFeature = {
                    name: name,
                    wkt: wkt,
                };

                try {
                    const response = await fetch('https://localhost:7058/api/Geometry', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(newFeature)
                    });

                    if (response.ok) {
                        toastr.success('Feature saved successfully!');
                        closePanel();
                        fetchAndDisplayGeometries();

                    } else {
                        const errorData = await response.json();
                        toastr.error(`Failed to save feature: ${errorData.message}`);
                    }
                }  
                catch (error) {
                    console.error('Error saving feature:', error);
                    toastr.error('Failed to save feature. Please try again.');
                }
            });

            document.getElementById('cancelFeatureBtn').addEventListener('click', function () {
                vectorSource.removeFeature(feature);
                closePanel();
            });
        }
    });

    map.removeInteraction(drawPoint);
    map.removeInteraction(drawPolygon);
}