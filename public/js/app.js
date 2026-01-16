const API_URL = 'http://localhost:3000/api/students';

document.getElementById('studentForm').addEventListener('submit', addStudent);

async function addStudent(e) {
    e.preventDefault();
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const course = document.getElementById('course').value.trim();

    if (!name || !email || !course) {
        showNotification('Please fill in all fields', 'error');
        return;
    }

    if (!isValidEmail(email)) {
        showNotification('Please enter a valid email', 'error');
        return;
    }

    showLoading(true);
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, course })
        });

        if (response.ok) {
            document.getElementById('name').value = '';
            document.getElementById('email').value = '';
            document.getElementById('course').value = '';
            loadStudents();
            showNotification('Student added successfully!', 'success');
        } else {
            const error = await response.json();
            showNotification(error.message || 'Error adding student', 'error');
        }
    } catch (error) {
        showNotification('Network error', 'error');
    } finally {
        showLoading(false);
    }
}

async function loadStudents() {
    showLoading(true);
    try {
        const response = await fetch(API_URL);
        const students = await response.json();
        const studentsList = document.getElementById('studentsList');
        studentsList.innerHTML = '';

        if (students.length === 0) {
            studentsList.innerHTML = '<p style="text-align: center; color: #666; font-style: italic;">No students found. Add some students to get started!</p>';
            return;
        }

        students.forEach((student, index) => {
            const studentDiv = document.createElement('div');
            studentDiv.className = 'student';
            studentDiv.style.animationDelay = `${index * 0.1}s`;
            studentDiv.innerHTML = `
                <div>
                    <strong>${student.name}</strong><br>
                    <span><i class="fas fa-envelope"></i> ${student.email}</span><br>
                    <span><i class="fas fa-book"></i> ${student.course}</span>
                </div>
                <div>
                    <button class="edit-btn" onclick="editStudent('${student._id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button onclick="deleteStudent('${student._id}')"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            studentsList.appendChild(studentDiv);
        });
    } catch (error) {
        showNotification('Error loading students', 'error');
    } finally {
        showLoading(false);
    }
}

async function deleteStudent(id) {
    if (confirm('Are you sure you want to delete this student?')) {
        showLoading(true);
        try {
            await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
            loadStudents();
            showNotification('Student deleted successfully!', 'success');
        } catch (error) {
            showNotification('Error deleting student', 'error');
        } finally {
            showLoading(false);
        }
    }
}

function editStudent(id) {
    // Create a modal for editing
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); display: flex; justify-content: center;
        align-items: center; z-index: 1000; animation: fadeIn 0.3s;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 30px; border-radius: 10px; width: 400px; max-width: 90%;">
            <h3>Edit Student</h3>
            <form id="editForm">
                <input type="text" id="editName" placeholder="Name" required><br><br>
                <input type="email" id="editEmail" placeholder="Email" required><br><br>
                <input type="text" id="editCourse" placeholder="Course" required><br><br>
                <button type="submit">Update</button>
                <button type="button" onclick="closeModal()">Cancel</button>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load current student data
    fetch(`${API_URL}/${id}`).then(res => res.json()).then(student => {
        document.getElementById('editName').value = student.name;
        document.getElementById('editEmail').value = student.email;
        document.getElementById('editCourse').value = student.course;
    });
    
    document.getElementById('editForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const newName = document.getElementById('editName').value.trim();
        const newEmail = document.getElementById('editEmail').value.trim();
        const newCourse = document.getElementById('editCourse').value.trim();
        
        if (!newName || !newEmail || !newCourse) {
            showNotification('Please fill in all fields', 'error');
            return;
        }
        
        if (!isValidEmail(newEmail)) {
            showNotification('Please enter a valid email', 'error');
            return;
        }
        
        try {
            const response = await fetch(`${API_URL}/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, email: newEmail, course: newCourse })
            });
            
            if (response.ok) {
                loadStudents();
                showNotification('Student updated successfully!', 'success');
                closeModal();
            } else {
                showNotification('Error updating student', 'error');
            }
        } catch (error) {
            showNotification('Network error', 'error');
        }
    });
    
    window.closeModal = () => document.body.removeChild(modal);
}

function showLoading(show) {
    const container = document.querySelector('.container');
    if (show) {
        if (!document.querySelector('.loading-overlay')) {
            const overlay = document.createElement('div');
            overlay.className = 'loading-overlay';
            overlay.style.cssText = `
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(255,255,255,0.8); display: flex;
                justify-content: center; align-items: center; z-index: 10;
                border-radius: 15px;
            `;
            overlay.innerHTML = '<div style="text-align: center;"><i class="fas fa-spinner fa-spin" style="font-size: 2em; color: #667eea;"></i><br>Loading...</div>';
            container.style.position = 'relative';
            container.appendChild(overlay);
        }
    } else {
        const overlay = document.querySelector('.loading-overlay');
        if (overlay) overlay.remove();
    }
}

function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed; top: 20px; right: 20px; padding: 15px 20px;
        border-radius: 8px; color: white; font-weight: bold; z-index: 1000;
        animation: slideIn 0.3s ease-out; max-width: 300px;
    `;
    notification.style.backgroundColor = type === 'success' ? '#28a745' : '#dc3545';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

loadStudents();