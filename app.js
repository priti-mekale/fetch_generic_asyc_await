
const cl = console.log;

const studentForm = document.getElementById('studentForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const contact = document.getElementById('contact');

const addStudentBtn = document.getElementById('addStudentBtn');
const updateStudentBtn = document.getElementById('updateStudentBtn');
const studentContainer = document.getElementById('studentContainer');
const loader = document.getElementById('loader');

let BASE_URL = "https://crud-27f49-default-rtdb.firebaseio.com";
let POST_URL = `${BASE_URL}/students.json`; // Firebase 'students' node

// Show message using SweetAlert
const snackBar = (msg, icon) => {
    Swal.fire({
        title: msg,
        icon: icon,
        timer: 2000
    });
};

// Convert Firebase object to array with IDs
const objToArr = (obj) => {
    let arr = [];
    for (let key in obj) {
        obj[key].id = key;
        arr.unshift(obj[key]);
    }
    return arr;
};

// Render student rows
const renderStudents = (arr) => {
    let result = ``;
    arr.forEach((student, i) => {
        result += `
            <tr id="${student.id}">
                <td>${i + 1}</td>
                <td>${student.firstName}</td>
                <td>${student.lastName}</td>
                <td>${student.email}</td>
                <td>${student.contact}</td>
                <td>
                    <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
                </td>
                <td>
                    <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
                </td>
            </tr>
        `;
    });
    studentContainer.innerHTML = result;
};

// Generic API call function using async/await
const makeApiCall = async (method, url, body = null) => {
    loader.classList.remove('d-none');

    try {
        let res = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json"
            },
            body: body ? JSON.stringify(body) : null
        });

        return await res.json();
    } catch (error) {
        cl("API Error:", error);
    } finally {
        loader.classList.add('d-none');
    }
};

// Initial fetch
const fetchAllStudents = async () => {
    let res = await makeApiCall('GET', POST_URL);
   
        let students = objToArr(res);
        renderStudents(students);
    
};
fetchAllStudents();

// Re-index serial numbers
const reIndexRows = () => {
    const rows = studentContainer.querySelectorAll('tr');
    rows.forEach((row, index) => {
        row.children[0].innerText = index + 1;
    });
};

// Add student
const onSubmitStudent = async (e) => {
    e.preventDefault();

    let student = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        contact: contact.value
    };

    let res = await makeApiCall('POST', POST_URL, student);
   
        student.id = res.name;
        studentForm.reset();

        let row = document.createElement('tr');
        row.setAttribute('id', student.id);
        row.innerHTML = `
            <td></td>
            <td>${student.firstName}</td>
            <td>${student.lastName}</td>
            <td>${student.email}</td>
            <td>${student.contact}</td>
            <td>
                <button onClick="onEdit(this)" class="btn btn-sm btn-outline-info">Edit</button>
            </td>
            <td>
                <button onClick="onRemove(this)" class="btn btn-sm btn-outline-danger">Remove</button>
            </td>
        `;

        studentContainer.prepend(row);
        reIndexRows();

        snackBar(`Student "${student.firstName}" added!`, "success");
   
};

// Edit student
const onEdit = async (btn) => {
    let id = btn.closest("tr").id;
    localStorage.setItem("editStudentId", id);
    let url = `${BASE_URL}/students/${id}.json`;

    let student = await makeApiCall("GET", url);
   
        firstName.value = student.firstName;
        lastName.value = student.lastName;
        email.value = student.email;
        contact.value = student.contact;

        addStudentBtn.classList.add('d-none');
        updateStudentBtn.classList.remove('d-none');
    
};

// Update student
const onUpdateStudent = async () => {
    let id = localStorage.getItem("editStudentId");
    let url = `${BASE_URL}/students/${id}.json`;

    let updatedStudent = {
        firstName: firstName.value,
        lastName: lastName.value,
        email: email.value,
        contact: contact.value,
        id: id
    };

    let res = await makeApiCall("PATCH", url, updatedStudent);
 
        let row = document.getElementById(id);
        let cells = row.getElementsByTagName("td");

        cells[1].innerText = res.firstName;
        cells[2].innerText = res.lastName;
        cells[3].innerText = res.email;
        cells[4].innerText = res.contact;

        studentForm.reset();
        addStudentBtn.classList.remove('d-none');
        updateStudentBtn.classList.add('d-none');

        snackBar(`Student "${res.firstName}" updated!`, "success");
    
};

// Remove student
const onRemove = async (btn) => {
    let confirm = await Swal.fire({
        title: "Delete this student?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!"
    });

    if (confirm.isConfirmed) {
        let row = btn.closest("tr");
        let id = row.id;
        let url = `${BASE_URL}/students/${id}.json`;

        await makeApiCall("DELETE", url);

        row.remove();
        reIndexRows();
        snackBar("Student removed successfully", "success");
    }
};

// Event listeners
studentForm.addEventListener("submit", onSubmitStudent);
updateStudentBtn.addEventListener("click", onUpdateStudent);

