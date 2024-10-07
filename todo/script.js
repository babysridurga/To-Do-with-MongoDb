// script.js

const addTaskButton = document.getElementById('addTaskButton');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');
const dateInput = document.getElementById('dateInput');
const summary = document.getElementById('summary');
let selectedDate = new Date().toISOString().split('T')[0]; // Default to today's date

dateInput.value = selectedDate; // Set default date input to today

dateInput.addEventListener('change', (event) => {
    selectedDate = event.target.value;
    renderTasks(selectedDate);
});

async function fetchTasks(date) {
    const response = await fetch(`http://localhost:5000/tasks/${date}`);
    return response.json();
}

async function renderTasks(selectedDate) {
    taskList.innerHTML = '';
    const tasks = await fetchTasks(selectedDate);
    let totalTasks = tasks.length;
    let doneTasks = tasks.filter(task => task.completed).length;

    tasks.forEach((task) => {
        const li = document.createElement('li');
        li.textContent = task.text;
        if (task.completed) {
            li.classList.add('completed');
        }

        li.addEventListener('click', async () => {
            task.completed = !task.completed;
            await fetch(`http://localhost:5000/tasks/${task._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            renderTasks(selectedDate);
        });

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            await fetch(`http://localhost:5000/tasks/${task._id}`, { method: 'DELETE' });
            renderTasks(selectedDate);
        });

        li.appendChild(deleteButton);
        taskList.appendChild(li);
    });
    updateSummary(totalTasks, doneTasks);
}

function updateSummary(total, done) {
    const remaining = total - done;
    summary.textContent = `Total Tasks: ${total} | Done Tasks: ${done} | Remaining Tasks: ${remaining}`;
}

addTaskButton.addEventListener('click', async () => {
    const taskText = taskInput.value.trim();
    if (taskText && selectedDate) {
        const newTask = {
            text: taskText,
            completed: false,
            date: selectedDate,
        };
        await fetch('http://localhost:5000/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        });
        taskInput.value = '';
        renderTasks(selectedDate);
    }
});

// Initial render
renderTasks(selectedDate);
