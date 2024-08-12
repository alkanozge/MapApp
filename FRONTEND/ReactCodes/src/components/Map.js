import React, { useEffect } from 'react';
import 'ol/ol.css';
import { Map as OlMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import WKT from 'ol/format/WKT';
import Draw from 'ol/interaction/Draw';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { jsPanel } from 'jspanel4'; 
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import 'jspanel4/dist/jspanel.css';

function Map() {
    useEffect(() => {
        const rasterLayer = new TileLayer({
            source: new OSM(),
        });

        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        const map = new OlMap({
            target: 'map',
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: fromLonLat([35.2433, 38.9637]),
                zoom: 6,
            }),
        });

        const wktFormat = new WKT();

        async function fetchAndDisplayGeometries() {
            try {
                const response = await fetch('https://localhost:7058/api/Geometry');
                const data = await response.json();

                console.log('Fetched geometries:', data);

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

                const styleFunction = function (feature) {
                    const geometryType = feature.getGeometry().getType();
                    if (geometryType === 'Point') {
                        return new Style({
                            image: new Icon({
                                src: '2991231.png',
                                scale: 0.12
                            })
                        });
                    } else if (geometryType === 'Polygon') {
                        return new Style({
                            fill: new Fill({
                                color: 'rgba(35, 120, 144, 0.39)'
                            }),
                            stroke: new Stroke({
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

        map.on('singleclick', function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                createPopup(feature);
            });
        });

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

        function openUpdatePanel(feature, id, name, wkt) {
            jsPanel.create({
                theme: 'primary',
                headerTitle: 'Update Feature',
                contentSize: '400 300',
                content: `
                    <form id="updateFeatureForm">
                        <label for="updateFeatureName">Name:</label>
                        <input type="text" id="updateFeatureName" value="${name}"><br>
                        <label for="updateFeatureWKT">WKT:</label>
                        <textarea id="updateFeatureWKT" rows="4">${wkt}</textarea><br>
                        <div class="update-panel-buttons">
                            <button type="button" id="updateSaveBtn">Save</button>
                        </div>
                    </form>
                `,
                callback: function (updatePanel) {
                    updatePanel.content.style.padding = '20px';

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
                                fetchAndDisplayGeometries();
                                updatePanel.close();
                            } else {
                                const errorData = await response.json();
                                toastr.error(`Failed to update feature: ${errorData.message}`);
                            }
                        } catch (error) {
                            console.error('Error updating feature:', error);
                            toastr.error('Failed to update feature. Please try again.');
                        }
                    });
                }
            });
        }

        let draw; 

        function addDrawInteraction(drawType) {
            if (draw) {
                map.removeInteraction(draw);
            }

            draw = new Draw({
                source: vectorSource,
                type: drawType,
            });

            map.addInteraction(draw);

            draw.on('drawend', async (event) => {
                const feature = event.feature;
                const geometry = feature.getGeometry();
                const wkt = wktFormat.writeGeometry(geometry);
                
                const newFeature = {
                    name: `New ${drawType}`,
                    wkt: wkt
                };

                try {
                    const response = await fetch('https://localhost:7058/api/Geometry', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(newFeature),
                    });

                    if (response.ok) {
                        toastr.success('Feature added successfully!');
                        fetchAndDisplayGeometries(); 
                    } else {
                        const errorData = await response.json();
                        toastr.error(`Failed to add feature: ${errorData.message}`);
                    }
                } catch (error) {
                    console.error('Error adding feature:', error);
                    toastr.error('Failed to add feature. Please try again.');
                }
            });
        }

        window.addEventListener('startDraw', (event) => {
            const drawType = event.detail;
            if (drawType === 'Point' || drawType === 'Polygon') {
                addDrawInteraction(drawType);
            }
        });

        return () => {
            window.removeEventListener('startDraw', () => {});
            if (draw) {
                map.removeInteraction(draw);
            }
        };
    }, []);

    return (
        <div id="map" style={{ height: '100vh', width: '100%' }}></div>
    );
}

export default Map;

/*
import React, { useEffect } from 'react';
import 'ol/ol.css';
import { Map as OlMap, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat } from 'ol/proj';
import WKT from 'ol/format/WKT';
import Icon from 'ol/style/Icon';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import { jsPanel } from 'jspanel4'; 
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import 'jspanel4/dist/jspanel.css';

function Map() {
    useEffect(() => {
        const rasterLayer = new TileLayer({
            source: new OSM(),
        });

        const vectorSource = new VectorSource();
        const vectorLayer = new VectorLayer({
            source: vectorSource,
        });

        const map = new OlMap({
            target: 'map',
            layers: [rasterLayer, vectorLayer],
            view: new View({
                center: fromLonLat([35.2433, 38.9637]),
                zoom: 6,
            }),
        });

        const wktFormat = new WKT();

        async function fetchAndDisplayGeometries() {
    try {
        const response = await fetch('https://localhost:7058/api/Geometry');
        const data = await response.json();

        console.log('Fetched geometries:', data); // Log the data to verify

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

        const styleFunction = function (feature) {
            const geometryType = feature.getGeometry().getType();
            if (geometryType === 'Point') {
                return new Style({
                    image: new Icon({
                        src: '2991231.png',
                        scale: 0.12
                    })
                });
            } else if (geometryType === 'Polygon') {
                return new Style({
                    fill: new Fill({
                        color: 'rgba(35, 120, 144, 0.39)'
                    }),
                    stroke: new Stroke({
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

        map.on('singleclick', function (evt) {
            map.forEachFeatureAtPixel(evt.pixel, function (feature) {
                createPopup(feature);
            });
        });

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

        function openUpdatePanel(feature, id, name, wkt) {
            jsPanel.create({
                theme: 'primary',
                headerTitle: 'Update Feature',
                contentSize: '400 300',
                content: `
                    <form id="updateFeatureForm">
                        <label for="updateFeatureName">Name:</label>
                        <input type="text" id="updateFeatureName" value="${name}"><br>
                        <label for="updateFeatureWKT">WKT:</label>
                        <textarea id="updateFeatureWKT" rows="4">${wkt}</textarea><br>
                        <div class="update-panel-buttons">
                            <button type="button" id="updateSaveBtn">Save</button>
                        </div>
                    </form>
                `,
                callback: function (updatePanel) {
                    updatePanel.content.style.padding = '20px';

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
                                fetchAndDisplayGeometries();
                                updatePanel.close();
                            } else {
                                const errorData = await response.json();
                                toastr.error(`Failed to update feature: ${errorData.message}`);
                            }
                        } catch (error) {
                            console.error('Error updating feature:', error);
                            toastr.error('Failed to update feature. Please try again.');
                        }
                    });
                }
            });
        }
    }, []);

    return <div id="map" style={{ width: '100%', height: '100vh' }}></div>;
}

export default Map;
*/