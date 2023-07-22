const taskForm = document.getElementById('taskForm');
const taskList = document.getElementById('taskList');
const filterForm = document.getElementById('filterForm');
const searchForm = document.getElementById('searchForm');
const viewBacklogsButton = document.getElementById('viewBacklogsButton');
const viewActivityLogsButton = document.getElementById('viewActivityLogsButton');
const activityLogsList = document.getElementById('activityLogsList');

// Array to store tasks
let tasks = [];
let activityLogs = [];

// Function to render the tasks
function renderTasks() {
    taskList.innerHTML = '';
    tasks.forEach((task, index) => {
        const li = document.createElement('li');
        // Display task details and buttons for editing/deleting
        li.innerHTML = `
        <div class="task-details">
        <span><strong>Task:</strong> ${task.title}</span>
        <span><strong>Category:</strong> ${task.category}</span>
        <span><strong>Tags:</strong> ${task.tags}</span>
        <span><strong>Due Date:</strong> ${task.dueDate}</span>
        <span><strong>Priority:</strong> ${task.priority}</span>
      </div>
      <div class="task-actions">
        <!-- Buttons for editing/deleting/toggling -->
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
        <button class="toggle-btn">${task.done ? 'Undone' : 'Done'}</button>
      </div>
    
        `;

        // Render subtasks
        if (task.subtasks && task.subtasks.length > 0) {
            const subtaskList = document.createElement('ul');
            task.subtasks.forEach(subtask => {
                const subtaskLi = document.createElement('li');
                subtaskLi.textContent = subtask;
                subtaskList.appendChild(subtaskLi);
            });
            li.appendChild(subtaskList);
        }

        // Input fields and button for editing
        const editFields = document.createElement('div');
        editFields.classList.add('edit-fields');
        editFields.innerHTML = `
            <input type="text" class="edit-title" value="${task.title}">
            <input type="text" class="edit-category" value="${task.category}">
            <input type="text" class="edit-tags" value="${task.tags}">
            <input type="date" class="edit-due-date" value="${task.dueDate}">
            <select class="edit-priority">
                <option value="low" ${task.priority === 'low' ? 'selected' : ''}>Low</option>
                <option value="medium" ${task.priority === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="high" ${task.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
            <button class="save-btn">Save</button>
            <button class="cancel-btn">Cancel</button>
        `;
        editFields.querySelector('.save-btn').addEventListener('click', () => saveTaskChanges(index));
        editFields.querySelector('.cancel-btn').addEventListener('click', () => cancelEdit(index));
        li.appendChild(editFields);

        const subtaskInput = document.createElement('input');
        subtaskInput.type = 'text';
        subtaskInput.placeholder = 'Add Subtask';
        subtaskInput.id = `subtaskInput-${index}`;
        li.appendChild(subtaskInput);

        const addSubtaskButton = document.createElement('button');
        addSubtaskButton.id='subtask-btn-1';
        addSubtaskButton.textContent = 'Add Subtask';
        addSubtaskButton.addEventListener('click', () => handleAddSubtask(index));
        li.appendChild(addSubtaskButton);

        li.querySelector('.edit-btn').addEventListener('click', () => {
            logActivity(`Task with ID ${index} was edited.`);
            editTask(index);
        });

        li.querySelector('.delete-btn').addEventListener('click', () => {
            deleteTask(index);
        });

        li.querySelector('.toggle-btn').addEventListener('click', () => {
            toggleTaskStatus(index);
        });

        taskList.appendChild(li);

        if (task.editing) {
            li.querySelector('.edit-fields').style.display = 'block';
            li.querySelector('.edit-btn').style.display = 'none';
            li.querySelector('.delete-btn').style.display = 'none';
            li.querySelector('.toggle-btn').style.display = 'none';
        } else {
            li.querySelector('.edit-fields').style.display = 'none';
            li.querySelector('.edit-btn').style.display = 'inline-block';
            li.querySelector('.delete-btn').style.display = 'inline-block';
            li.querySelector('.toggle-btn').style.display = 'inline-block';
        }
    });
}


// Function to render pending and missed tasks (backlogs)
function renderBacklogs() {
    const now = new Date();
    const backlogs = tasks.filter(task => task.done === false && new Date(task.dueDate) < now);

    const backlogsList = document.getElementById('backlogsList');
    backlogsList.innerHTML = '';

    if (backlogs.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No pending or missed tasks.';
        backlogsList.appendChild(li);
    } else {
        backlogs.forEach((task, index) => {
            const li = document.createElement('li');
            li.textContent = `${task.title} - Due Date: ${task.dueDate}`;
            backlogsList.appendChild(li);
        });
    }
}

// Function to render activity logs
function renderActivityLogs() {
    activityLogsList.innerHTML = '';

    if (activityLogs.length === 0) {
        const li = document.createElement('li');
        li.textContent = 'No activity logs available.';
        activityLogsList.appendChild(li);
    } else {
        activityLogs.forEach(log => {
            const li = document.createElement('li');
            li.textContent = log;
            activityLogsList.appendChild(li);
        });
    }
}

// Function to log activity
function logActivity(activity) {
    const now = new Date();
    const log = `[${now.toLocaleString()}] ${activity}`;
    activityLogs.push(log);
    renderActivityLogs();
}

// Function to add a new task
function addTask(title, category, tags, dueDate, priority, reminder, subtasks) {
    const reminderTime = reminder ? new Date(reminder) : null;
    const newTask = {
        title,
        category,
        tags,
        dueDate,
        priority,
        reminder,
        reminderTime,
        done: false,
        editing: false,
        subtasks: subtasks || []
    };
    tasks.push(newTask);
    logActivity(`Task with ID ${tasks.indexOf(newTask)} was added.`);
    renderTasks();
    setReminders();
}


// Function to delete a task
function deleteTask(index) {
    const deletedTask = tasks[index];
    removeTaskAndUpdateStorage(index);
    logActivity(`Task "${deletedTask.title}" with ID ${index} was deleted.`);
    renderTasks();
    
}
// Function to edit a task
function editTask(index) {
    tasks[index].editing = true;
    renderTasks();
}

// Function to save changes made during editing
function saveTaskChanges(index) {
    const li = taskList.children[index];
    const title = li.querySelector('.edit-title').value;
    const category = li.querySelector('.edit-category').value;
    const tags = li.querySelector('.edit-tags').value;
    const dueDate = li.querySelector('.edit-due-date').value;
    const priority = li.querySelector('.edit-priority').value;

    tasks[index].title = title;
    tasks[index].category = category;
    tasks[index].tags = tags;
    tasks[index].dueDate = dueDate;
    tasks[index].priority = priority;
    tasks[index].editing = false;

    renderTasks();
}

// Function to cancel editing
function cancelEdit(index) {
    tasks[index].editing = false;
    renderTasks();
}

// Function to toggle task status (Done/Undone)
function toggleTaskStatus(index) {
    tasks[index].done = !tasks[index].done;
    renderTasks();
}

// Function to add a subtask to a main task
function addSubtask(index, subtask) {
    tasks[index].subtasks.push(subtask);
    logActivity(`Subtask "${subtask}" was added to task with ID ${index}.`);
    renderTasks();
}


// Event listener for adding a subtask
function handleAddSubtask(index) {
    const subtaskInput = document.getElementById(`subtaskInput-${index}`);
    const subtask = subtaskInput.value.trim();
    if (subtask !== '') {
        addSubtask(index, subtask);
        subtaskInput.value = '';
    }
}

// Function to filter tasks based on due date
function filterByDueDate(dueDate) {
    const filteredTasks = tasks.filter(task => task.dueDate === dueDate);
    renderFilteredTasks(filteredTasks);
}

// Function to filter tasks based on category
function filterByCategory(category) {
    const filteredTasks = tasks.filter(task => task.category.toLowerCase() === category.toLowerCase());
    renderFilteredTasks(filteredTasks);
}

// Function to filter tasks based on priority
function filterByPriority(priority) {
    const filteredTasks = tasks.filter(task => task.priority === priority);
    renderFilteredTasks(filteredTasks);
}

// Function to render filtered tasks
function renderFilteredTasks(filteredTasks) {
    taskList.innerHTML = '';
    filteredTasks.forEach((task, index) => {
        const li = document.createElement('li');
        // Display task details and buttons for editing/deleting
        li.innerHTML = `
        <div class="task-details">
        <span><strong>Task:</strong> ${task.title}</span>
        <span><strong>Category:</strong> ${task.category}</span>
        <span><strong>Tags:</strong> ${task.tags}</span>
        <span><strong>Due Date:</strong> ${task.dueDate}</span>
        <span><strong>Priority:</strong> ${task.priority}</span>
      </div>
      <div class="task-actions">
        <!-- Buttons for editing/deleting/toggling -->
        <button class="edit-btn">Edit</button>
        <button class="delete-btn">Delete</button>
        <button class="toggle-btn">${task.done ? 'Undone' : 'Done'}</button>
      </div>
    
        `;

        // Render subtasks
        if (task.subtasks && task.subtasks.length > 0) {
            const subtaskList = document.createElement('ul');
            task.subtasks.forEach(subtask => {
                const subtaskLi = document.createElement('li');
                subtaskLi.textContent = subtask;
                subtaskList.appendChild(subtaskLi);
            });
            li.appendChild(subtaskList);
        }

        // Input field and button for adding subtasks
        const subtaskInput = document.createElement('input');
        subtaskInput.type = 'text';
        subtaskInput.placeholder = 'Add Subtask';
        subtaskInput.id = `subtaskInput-${index}`;
        li.appendChild(subtaskInput);

        const addSubtaskButton = document.createElement('button');
        addSubtaskButton.textContent = 'Add Subtask';
        addSubtaskButton.addEventListener('click', () => handleAddSubtask(index));
        li.appendChild(addSubtaskButton);

        li.querySelector('.edit-btn').addEventListener('click', () => editTask(index));
        li.querySelector('.delete-btn').addEventListener('click', () => deleteTask(index));
        li.querySelector('.toggle-btn').addEventListener('click', () => toggleTaskStatus(index));
        taskList.appendChild(li);
    });
}

// Function to sort tasks based on selected option
function sortTasks(option) {
    switch (option) {
        case 'category':
            tasks.sort((a, b) => a.category.localeCompare(b.category));
            break;
        case 'priority':
            tasks.sort((a, b) => a.priority.localeCompare(b.priority));
            break;
        case 'dueDate':
            tasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
            break;
    }
    renderTasks();
}

// Function to search tasks based on search query
function searchTasks(query, searchType) {
    const searchResults = tasks.filter(task => {
        const lowerCaseTitle = task.title.toLowerCase();
        const lowerCaseTags = task.tags.toLowerCase();
        const lowerCaseCategory = task.category.toLowerCase();

        switch (searchType) {
            case 'exactTodo':
                return lowerCaseTitle === query.toLowerCase();
            case 'subTasks':
                return lowerCaseTitle.includes(query.toLowerCase());
            case 'similarWords':
                return lowerCaseTags.includes(query.toLowerCase()) || lowerCaseCategory.includes(query.toLowerCase());
            case 'partialSearch':
                return lowerCaseTitle.includes(query.toLowerCase()) || lowerCaseTags.includes(query.toLowerCase()) || lowerCaseCategory.includes(query.toLowerCase());
            case 'tags':
                return lowerCaseTags.includes(query.toLowerCase());
            default:
                return false;
        }
    });

    renderFilteredTasks(searchResults);
}

// Function to set reminders
function setReminders() {
    tasks.forEach(task => {
        const { title, reminderTime } = task;
        if (reminderTime && reminderTime > new Date()) {
            const timeDifference = reminderTime - new Date();
            setTimeout(() => {
                alert(`Reminder: ${title}`);
            }, timeDifference);
        }
    });
}


function saveToLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('activityLogs', JSON.stringify(activityLogs));
  }
  
  // Function to load tasks and activity logs from localStorage
  function loadFromLocalStorage() {
    const storedTasks = localStorage.getItem('tasks');
    const storedActivityLogs = localStorage.getItem('activityLogs');
    if (storedTasks) {
      tasks = JSON.parse(storedTasks);
    }
    if (storedActivityLogs) {
      activityLogs = JSON.parse(storedActivityLogs);
    }
  }


  function initApp() {
    loadFromLocalStorage();
    renderTasks();
    renderBacklogs();
    renderActivityLogs();
  }
  function removeTaskAndUpdateStorage(index) {
    tasks.splice(index, 1);
    saveToLocalStorage();
  }
  
  
  
  // Call initApp to initialize the application when the page loads
  initApp();
  
  

// Event listener for the form submission

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const taskTitle = document.getElementById('taskTitle').value;
    const category = document.getElementById('category').value;
    const tags = document.getElementById('tags').value;
    const dueDate = document.getElementById('dueDate').value;
    const priority = document.getElementById('priority').value;
    const reminder = document.getElementById('reminder').value;
    addTask(taskTitle, category, tags, dueDate, priority, reminder);
    taskForm.reset();
    saveToLocalStorage(); // Save the updated tasks to localStorage
  });

// Event listener for the filter form submission

filterForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const dueDateFilter = document.getElementById('dueDateFilter').value;
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
  
    if (dueDateFilter) {
      filterByDueDate(dueDateFilter);
    } else if (categoryFilter) {
      filterByCategory(categoryFilter);
    } else if (priorityFilter) {
      filterByPriority(priorityFilter);
    } else {
      renderTasks();
    }
  });
  
// Event listener for the sort button clicks
document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const option = e.target.dataset.sortOption;
      sortTasks(option);
      saveToLocalStorage(); // Save the sorted tasks to localStorage
    });
  });
  
// Event listener for the search form submission
searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const searchQuery = document.getElementById('searchQuery').value;
    const searchType = document.getElementById('searchType').value;
  
    if (searchQuery) {
      searchTasks(searchQuery, searchType);
    } else {
      renderTasks();
    }
  });
  

  viewBacklogsButton.addEventListener('click', () => {
    renderBacklogs();
  });
  
  // Event listener for View Activity Logs button
  viewActivityLogsButton.addEventListener('click', () => {
    renderActivityLogs();
  });
  
  // Call saveToLocalStorage whenever tasks or activityLogs change
  window.addEventListener('beforeunload', () => {
    saveToLocalStorage();
  });
  

// Initial rendering of tasks
renderTasks();

// Set initial reminders
setReminders();