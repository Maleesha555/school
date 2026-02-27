document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const searchInput = document.getElementById('searchInput');
    const addStudentBtn = document.getElementById('addStudentBtn');
    const studentModal = document.getElementById('studentModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const studentForm = document.getElementById('studentForm');
    const studentsTableBody = document.getElementById('studentsTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const modalTitle = document.getElementById('modalTitle');
    const modalSubtitle = document.getElementById('modalSubtitle');
    const editStudentId = document.getElementById('editStudentId');
    const toastMessage = document.getElementById('toast');
    const toastText = document.getElementById('toastMessage');

    // Load Data from LocalStorage
    let students = JSON.parse(localStorage.getItem('eduAdmin_students')) || [];

    // Helper: Generate ID
    const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

    // Initial sample data if empty
    if (students.length === 0) {
        students = [
            {
                id: generateId(),
                admissionId: 'ADM-2023-001',
                fullName: 'Eleanor Vance',
                address: '42 Hill House, New England',
                birthday: '2008-04-12',
                admissionDate: '2023-01-15',
                guardianName: 'Theodora Vance',
                guardianContact: '555-019-2834'
            },
            {
                id: generateId(),
                admissionId: 'ADM-2023-002',
                fullName: 'Luke Crain',
                address: '891 Oak Lane, Springfield',
                birthday: '2009-11-20',
                admissionDate: '2023-01-16',
                guardianName: 'Steven Crain',
                guardianContact: '555-827-1092'
            },
            {
                id: generateId(),
                admissionId: 'ADM-2024-001',
                fullName: 'Shirley Crain',
                address: '102 Maple Street, Boston',
                birthday: '2010-06-05',
                admissionDate: '2024-02-10',
                guardianName: 'Hugh Crain',
                guardianContact: '555-332-9011'
            }
        ];
        saveData();
    }

    // Initialize Table
    renderTable();

    // Set today's date for new admission
    document.getElementById('admissionDate').valueAsDate = new Date();

    // Event Listeners
    addStudentBtn.addEventListener('click', () => openModal());
    closeModalBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    studentForm.addEventListener('submit', handleFormSubmit);

    // Instant Search functionality
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value;
        renderTable(query);
    });

    // Keyboard support for modal
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && studentModal.classList.contains('active')) {
            closeModal();
        }
    });

    // Outside click for modal
    studentModal.addEventListener('click', (e) => {
        if (e.target === studentModal) {
            closeModal();
        }
    });

    // Helper: Calculate Age from Birthday
    function calculateAge(birthday) {
        const birthDate = new Date(birthday);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }

    // Helper: Format Date for Display
    function formatDate(dateString) {
        if (!dateString) return 'N/A';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    }

    // Main render function
    function renderTable(searchQuery = '') {
        studentsTableBody.innerHTML = '';
        const lowercaseQuery = searchQuery.toLowerCase().trim();

        const filteredStudents = students.filter(s => {
            const matchId = s.admissionId.toLowerCase().includes(lowercaseQuery);
            const matchName = s.fullName.toLowerCase().includes(lowercaseQuery);
            return matchId || matchName;
        });

        // Toggle Empty State
        if (filteredStudents.length === 0) {
            noDataMessage.classList.remove('hidden');
            document.getElementById('studentsTable').style.display = 'none';
        } else {
            noDataMessage.classList.add('hidden');
            document.getElementById('studentsTable').style.display = 'table';

            // Sort by Admission Date (newest first)
            filteredStudents.sort((a, b) => new Date(b.admissionDate) - new Date(a.admissionDate));

            filteredStudents.forEach((student, index) => {
                const tr = document.createElement('tr');
                // Stagger table row animation
                tr.style.animation = `fadeIn 0.3s ease forwards ${(index * 0.05)}s`;
                tr.style.opacity = '0';

                tr.innerHTML = `
                    <td class="highlight">${student.admissionId}</td>
                    <td><strong>${student.fullName}</strong></td>
                    <td><span class="badge">${calculateAge(student.birthday)} years</span></td>
                    <td>${student.guardianName}</td>
                    <td>${student.guardianContact}</td>
                    <td>${formatDate(student.admissionDate)}</td>
                    <td class="actions-col">
                        <button class="icon-btn edit-btn" onclick="editStudent('${student.id}')" title="Edit Record">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                    </td>
                `;
                studentsTableBody.appendChild(tr);
            });
        }
    }

    // Open Modal
    function openModal(student = null) {
        studentForm.reset();

        if (student) {
            modalTitle.innerText = 'Edit Student Record';
            modalSubtitle.innerText = 'Update details for ' + student.fullName;
            editStudentId.value = student.id;

            // Populate fields
            document.getElementById('admissionId').value = student.admissionId;
            document.getElementById('fullName').value = student.fullName;
            document.getElementById('address').value = student.address;
            document.getElementById('birthday').value = student.birthday;
            document.getElementById('admissionDate').value = student.admissionDate;
            document.getElementById('guardianName').value = student.guardianName;
            document.getElementById('guardianContact').value = student.guardianContact;
        } else {
            modalTitle.innerText = 'Register New Student';
            modalSubtitle.innerText = 'Enter the complete details below.';
            editStudentId.value = '';
            document.getElementById('admissionDate').valueAsDate = new Date(); // Default today
        }

        studentModal.classList.add('active');
        document.getElementById('admissionId').focus();
    }

    // Close Modal
    function closeModal() {
        studentModal.classList.remove('active');
    }

    // Handle Form submission
    function handleFormSubmit(e) {
        e.preventDefault();

        const newStudent = {
            admissionId: document.getElementById('admissionId').value.trim(),
            fullName: document.getElementById('fullName').value.trim(),
            address: document.getElementById('address').value.trim(),
            birthday: document.getElementById('birthday').value,
            admissionDate: document.getElementById('admissionDate').value,
            guardianName: document.getElementById('guardianName').value.trim(),
            guardianContact: document.getElementById('guardianContact').value.trim()
        };

        const existingId = editStudentId.value;

        if (existingId) {
            // Updating existing
            const index = students.findIndex(s => s.id === existingId);
            if (index > -1) {
                // Ensure ID is unique among OTHERS
                const duplicate = students.find(s => s.admissionId.toLowerCase() === newStudent.admissionId.toLowerCase() && s.id !== existingId);
                if (duplicate) {
                    showToast('Admission ID already exists!', 'error');
                    return;
                }
                students[index] = { ...students[index], ...newStudent };
                showToast('Student record updated successfully.');
            }
        } else {
            // Adding new
            // Check if Admission ID exists
            const duplicate = students.find(s => s.admissionId.toLowerCase() === newStudent.admissionId.toLowerCase());
            if (duplicate) {
                showToast('Admission ID already exists!', 'error');
                return;
            }
            newStudent.id = generateId();
            students.push(newStudent);
            showToast('New student registered successfully.');
        }

        saveData();
        renderTable(searchInput.value); // Re-render keeping search context
        closeModal();
    }

    // Toast Notification helper
    function showToast(message, type = 'success') {
        toastText.innerText = message;
        toastMessage.className = 'toast show';

        if (type === 'error') {
            toastMessage.style.background = 'var(--bg-color)';
            toastMessage.style.borderColor = 'var(--text-alt)';
            toastMessage.style.color = 'var(--text-alt)';
            toastMessage.querySelector('i').className = 'fa-solid fa-circle-exclamation';
        } else {
            toastMessage.style.background = 'var(--bg-color)';
            toastMessage.style.borderColor = 'var(--text-alt)';
            toastMessage.style.color = 'var(--text-alt)';
            toastMessage.querySelector('i').className = 'fa-solid fa-circle-check';
        }

        setTimeout(() => {
            toastMessage.classList.remove('show');
        }, 3000);
    }

    // Expose edit function to global scope for onclick handler in table
    window.editStudent = function (id) {
        const student = students.find(s => s.id === id);
        if (student) {
            openModal(student);
        }
    };

    function saveData() {
        localStorage.setItem('eduAdmin_students', JSON.stringify(students));
    }
});

// Adding fade-in animation rules dynamically
const style = document.createElement('style');
style.innerHTML = `
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .badge {
        background: var(--bg-color);
        color: var(--text-alt);
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 0.85rem;
        font-weight: 700;
        border: 2px solid var(--text-alt);
    }
`;
document.head.appendChild(style);
