// Attach event handler to the select element
document.getElementById('selectBox').addEventListener('change', saveOption);

// Define the event handler function
function saveOption() {
    selectedOption = document.getElementById('selectBox').value;
  // Save the selected option value to localStorage or any other desired storage
  // method for persistence across page reloads
  localStorage.setItem('userMethod', selectedOption);
  console.log(selectedOption);
}

// Retrieve the saved value from localStorage
var selectedOption = localStorage.getItem('userMethod');

// Check if the retrieved value is not null or undefined
if (selectedOption !== null && selectedOption !== undefined) {
  // Perform any necessary actions with the retrieved value
  let userSelection = selectedOption;
}
