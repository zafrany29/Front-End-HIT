//Ron Gerbi 205694268
//Omer Zafrany 318877420

import { openCaloriesDB, addCalories, getCaloriesByMonth } from './idb.js';

// Create an object to hold the state (including the db reference)
const appState = {
    db: null,
};

// Function to initialize the database
async function initializeDB() {
    try {
        appState.db = await openCaloriesDB('caloriesdb', 1);
        console.log('Database initialized');
    } catch (error) {
        console.error('Error initializing the database:', error);
    }
}

// Function to handle form submission for adding a calorie entry
async function handleCalorieFormSubmit(e) {
    e.preventDefault();

    const calories = document.getElementById('calories').value;
    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const date = document.getElementById('date').value;

    if (!calories || !category || !description || !date) {
        alert('Please fill out all fields before submitting.');
        return;
    }

    const entry = {
        calories: parseInt(calories),
        category,
        description,
        date,
    };

    try {
        await addCalories(appState.db, entry);
        alert('Calorie entry added successfully!');
        e.target.reset();
    } catch (error) {
        console.error('Error adding calorie entry:', error);
        alert('Error adding calorie entry. Please try again.');
    }
}

// Function to handle form submission for generating a monthly report
async function handleReportFormSubmit(e) {
    e.preventDefault();

    const reportDate = document.getElementById('reportDate').value;
    const [year, month] = reportDate.split('-').map(Number);

    try {
        const entries = await getCaloriesByMonth(appState.db, year, month);
        displayReport(entries);
    } catch (error) {
        console.error('Error generating report:', error);
    }
}

// Function to display the report
function displayReport(entries) {
    const reportResults = document.getElementById('reportResults');
    reportResults.innerHTML = '';

    if (entries.length === 0) {
        reportResults.innerHTML = '<p>No entries found for the selected month.</p>';
        return;
    }

    const totalCalories = entries.reduce((total, entry) => total + entry.calories, 0);

    reportResults.innerHTML = `
        <h4>Report for Selected Month</h4>
        <p>Total Calories: ${totalCalories}</p>
        <ul class="list-group">
            ${entries
                .map(
                    (entry) => `
                    <li class="list-group-item">
                        <strong>${entry.category}</strong> - ${entry.description} 
                        (${entry.calories} calories) on ${new Date(entry.date).toLocaleDateString()}
                    </li>
                `
                )
                .join('')}
        </ul>
    `;
}


// Event listeners
window.addEventListener('DOMContentLoaded', initializeDB);
document.getElementById('calorieForm').addEventListener('submit', handleCalorieFormSubmit);
document.getElementById('reportForm').addEventListener('submit', handleReportFormSubmit);
