#Team 7 Medical Clinic Database

Files:
The Server folder contains the backend portion of the application. The index.js file, contains the routes, post and get methods.
The test.js file contains the connection to the MySQL database server and contaons the query calls and actions.
The views folder contains all the frontend html and ejs pages used in the project. The other folders and files are used used to host the application.

Running The Application:
The technology used in the project is html, node.js, express.js, and MySQL.

Web Link to Project:
localhost:3000/auth

Log in information:
    Patient: This login allows the user to schedule/cancel appointments, view upcoming appointments, view prescriptions, view appointment summaries, view location and hours, and change account settings.
	
	example login
        Username: username1
        Password: password1
	
    
Doctor: This login allows the user to cancel appointments, view upcoming appointments, view/assign prescriptions, view/assign appointment summaries, view location and hours, and change account settings.

	example login
        Username: user1
        Password: pass1
	
	trigger #1) a doctor can cancel an apointment of a patient in the doctor's scedule
	
	trigger #2) a patient is unable to be prescribed more than 3 new medications each day
	

Nurse: This login allows the user to change account settings, view location and hours, and generate reports.

        Username: user2
        Password: pass2
		
	"nurses" are a login used to see reports 
	
	
	
