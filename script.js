
const inputBox = document.getElementById('inputBox');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const filterOptions = document.getElementById('filterOptions');
const searchBox = document.getElementById('searchBox');
const progressBar = document.getElementById('progressBar');
const sortOptions = document.getElementById('sortOptions');

let editTodo = null;

// Function to add or edit a task
const addTodo = () => {
    const inputText = inputBox.value.trim();
    if (!inputText) {
        alert("You must write something in your to-do");
        return;
    }

    const category = document.getElementById('categorySelect').value;
    const priority = document.getElementById('prioritySelect').value;
    const dueDate = document.getElementById('dueDate').value;

    if (addBtn.textContent === "Edit") {
        // Update the existing task
        const taskId = editTodo.parentElement.dataset.id;

        // Update the DOM
        editTodo.parentElement.querySelector('.task-text').textContent = inputText;
        editTodo.parentElement.querySelector('.task-category').textContent = category;
        editTodo.parentElement.querySelector('.task-priority').textContent = priority;
        editTodo.parentElement.querySelector('.task-due-date').textContent = dueDate || 'No due date';

        // Update Local Storage
        saveUpdatedTaskToLocalStorage(taskId, inputText, category, priority, dueDate);

        // Reset the button and input
        addBtn.textContent = "Add";
        inputBox.value = "";
        editTodo = null;
    } else {
        // Add a new task
        const taskId = Date.now().toString();
        createTaskElement(taskId, inputText, category, priority, dueDate);
        saveTaskToLocalStorage(taskId, inputText, category, priority, dueDate);
        inputBox.value = "";
    }
    updateProgressBar();
};



// Function to create a task element
const createTaskElement = (id, text, category, priority, dueDate) => {
    const li = document.createElement('li');
    li.classList.add('todo-item');
    li.dataset.id = id;

    li.innerHTML = `
        <div class="task-left">
            <span class="task-text">${text}</span>
        </div>
        <div class="task-right">
            <span class="task-category">${category}</span>
            <span class="task-priority">${priority}</span>
            <span class="task-due-date">${dueDate ? dueDate : 'No due date'}</span>
            <button class="editBtn">Edit</button>
            <button class="deleteBtn">Delete</button>
            <input type="checkbox" class="completeCheckbox">
        </div>
    `;

    todoList.appendChild(li);
};



// Function to update a task when editing
const updateTask = (todoElement, text, category, priority, dueDate) => {
    const taskId = todoElement.parentElement.dataset.id;
    todoElement.parentElement.querySelector('.task-text').textContent = text;
    todoElement.parentElement.querySelector('.task-category').textContent = category;
    todoElement.parentElement.querySelector('.task-priority').textContent = priority;
    todoElement.parentElement.querySelector('.task-due-date').textContent = dueDate;
    saveUpdatedTaskToLocalStorage(taskId, text, category, priority, dueDate);
};

// Function to update progress bar
const updateProgressBar = () => {
    const totalTasks = todoList.querySelectorAll('.todo-item').length;
    const completedTasks = todoList.querySelectorAll('.todo-item.completed').length;
    const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    progressBar.style.width = `${progress}%`;
    progressBar.textContent = `${Math.round(progress)}%`;
};

// Function to save new task to Local Storage
const saveTaskToLocalStorage = (id, text, category, priority, dueDate) => {
    const tasks = JSON.parse(localStorage.getItem('todos')) || [];
    tasks.push({ id, text, category, priority, dueDate });
    localStorage.setItem('todos', JSON.stringify(tasks));
};

// Function to save updated task to Local Storage
const saveUpdatedTaskToLocalStorage = (id, text, category, priority, dueDate) => {
    const tasks = JSON.parse(localStorage.getItem('todos')) || [];
    const taskIndex = tasks.findIndex(task => task.id === id);

    if (taskIndex !== -1) {
        tasks[taskIndex] = { id, text, category, priority, dueDate };
        localStorage.setItem('todos', JSON.stringify(tasks));
    }
};


// Function to delete task from Local Storage
const deleteTaskFromLocalStorage = (id) => {
    const tasks = JSON.parse(localStorage.getItem('todos')) || [];
    const updatedTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('todos', JSON.stringify(updatedTasks));
};

// Function to load tasks from Local Storage
const loadTasksFromLocalStorage = () => {
    const tasks = JSON.parse(localStorage.getItem('todos')) || [];
    tasks.forEach(task => {
        createTaskElement(task.id, task.text, task.category, task.priority, task.dueDate);
    });
    updateProgressBar();
};

// Event listener for Add/Update task
document.addEventListener('DOMContentLoaded', loadTasksFromLocalStorage);
addBtn.addEventListener('click', addTodo);

// Event listener for task actions (edit, delete, complete)
todoList.addEventListener('click', (e) => {
    const taskElement = e.target.closest('.todo-item');
    const taskId = taskElement.dataset.id;

    if (e.target.classList.contains('deleteBtn')) {
        // Delete task
        todoList.removeChild(taskElement);
        deleteTaskFromLocalStorage(taskId);
    } else if (e.target.classList.contains('editBtn')) {
        // Edit task
        inputBox.value = taskElement.querySelector('.task-text').textContent;
        document.getElementById('categorySelect').value = taskElement.querySelector('.task-category').textContent;
        document.getElementById('prioritySelect').value = taskElement.querySelector('.task-priority').textContent;
        document.getElementById('dueDate').value = taskElement.querySelector('.task-due-date').textContent === 'No due date' ? '' : taskElement.querySelector('.task-due-date').textContent;

        addBtn.textContent = "Edit";
        editTodo = e.target; // Set the current edit button reference
    } else if (e.target.classList.contains('completeCheckbox')) {
        // Mark task as completed
        taskElement.classList.toggle('completed');
        updateProgressBar();
    }
});


// Event listener for search functionality
searchBox.addEventListener('input', () => {
    const searchTerm = searchBox.value.toLowerCase();
    document.querySelectorAll('.todo-item').forEach(item => {
        const text = item.querySelector('.task-text').textContent.toLowerCase();
        item.style.display = text.includes(searchTerm) ? 'flex' : 'none';
    });
});

// Event listener for filter functionality
filterOptions.addEventListener('change', () => {
    const filter = filterOptions.value;
    document.querySelectorAll('.todo-item').forEach(item => {
        const isCompleted = item.classList.contains('completed');
        item.style.display = (filter === 'all') ||
                             (filter === 'completed' && isCompleted) ||
                             (filter === 'pending' && !isCompleted) ? 'flex' : 'none';
    });
});

sortOptions.addEventListener('change', () => {
    const tasks = Array.from(todoList.children); // Convert NodeList to an array
    const sortType = sortOptions.value;

    tasks.sort((a, b) => {
        if (sortType === 'dueDate') {
            // Convert "No due date" to null or compare dates
            const dateA = new Date(a.querySelector('.task-due-date').textContent || '9999-12-31');
            const dateB = new Date(b.querySelector('.task-due-date').textContent || '9999-12-31');
            return dateA - dateB;
        }
        if (sortType === 'priority') {
            const priorities = { High: 1, Medium: 2, Low: 3 }; // Priority ranking
            const priorityA = priorities[a.querySelector('.task-priority').textContent];
            const priorityB = priorities[b.querySelector('.task-priority').textContent];
            return priorityA - priorityB;
        }
        if (sortType === 'category') {
            const categoryA = a.querySelector('.task-category').textContent.toLowerCase();
            const categoryB = b.querySelector('.task-category').textContent.toLowerCase();
            return categoryA.localeCompare(categoryB);
        }
        return 0; // Default: no sorting
    });

    // Re-append sorted tasks to the todoList
    tasks.forEach(task => todoList.appendChild(task));
});
