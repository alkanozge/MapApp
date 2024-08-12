import React from 'react';
import Map from './Map';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

function App() {
    const handleAddPoint = () => {
        window.dispatchEvent(new CustomEvent('startDraw', { detail: 'Point' }));
    };

    const handleAddPolygon = () => {
        window.dispatchEvent(new CustomEvent('startDraw', { detail: 'Polygon' }));
    };

    const handleQuery = () => {
        console.log("Query button clicked");
    };

    const handleDeletePoint = async (id) => {
        try {
            const response = await fetch(`https://localhost:7058/api/Geometry/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toastr.success('Point deleted successfully!');
            } else {
                const errorData = await response.json();
                toastr.error(`Failed to delete point: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting point:', error);
            toastr.error('Failed to delete point. Please try again.');
        }
    };

    return (
        <div>
            <nav>
                <button onClick={handleAddPoint}>Add Point</button>
                <button onClick={handleAddPolygon}>Add Polygon</button>
                <button onClick={handleQuery}>Query</button>
            </nav>
            <Map onDeletePoint={handleDeletePoint} />
        </div>
    );
}

export default App;

/*
import React from 'react';
import Map from './Map';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

function App() {
    const handleAddPoint = () => {
        console.log("Add Point button clicked");
    
        
    };
    

    const handleAddPolygon = () => {
        console.log("Add Polygon button clicked");
    };

    const handleQuery = () => {
        console.log("Query button clicked");
    };

    const handleDeletePoint = async (id) => {
        try {
            const response = await fetch(`https://localhost:7058/api/Geometry/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                toastr.success('Point deleted successfully!');
                // You may need to use a method to refresh the map or state
                // e.g., by lifting state up or using a state management library
            } else {
                const errorData = await response.json();
                toastr.error(`Failed to delete point: ${errorData.message}`);
            }
        } catch (error) {
            console.error('Error deleting point:', error);
            toastr.error('Failed to delete point. Please try again.');
        }
    };

    return (
        <div>
            <nav>
                <button onClick={handleAddPoint}>Add Point</button>
                <button onClick={handleAddPolygon}>Add Polygon</button>
                <button onClick={handleQuery}>Query</button>
            </nav>
            <Map onDeletePoint={handleDeletePoint} />
        </div>
    );
}

export default App;
*/