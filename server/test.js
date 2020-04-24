var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');

var connection = mysql.createConnection({
	host: '73.32.82.191',
    user: 'team7vue',
    password:'team7team7',
	database:'Team7-Medical',
	multipleStatements: true
});
var app = express();
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.set('view engine', 'ejs'); 


exports.register = function(req,res){
    // console.log("req",req.body);
    

    
      var username = req.body.username;
      var password = req.body.password;
      var name = req.body.name;
      var DOB = req.body.DOB.toString();
      var email = req.body.email;
      var phone = req.body.phone;
      var address = req.body.address;
      var sex = req.body.sex;
      var ICEname = req.body.ICEname;
      var number = req.body.number;

      
      
    
    var sql = "INSERT INTO `patient`(DOB,username,password,name,email,phone_number,adress,sex,person_ICE,phone_ICE) VALUES (?,?,?,?,?,?,?,?,?,?) ";
    connection.query(sql,[DOB,username,password,name,email,phone,address,sex,ICEname,number],function(error,results,fields){
      if(error){
        throw error;
        
      }
      else{
		res.redirect('/success');
        res.end();
      }
    });
  
  
  }

function getemployeeType(empID){
	var sql2 = "SELECT employee_Type FROM `Team7-medical`.`employee` WHERE employee_ID = ?";
	connection.query(sql2,[empID],function(error,results,fields){
		if(error) throw error;
		else{
			var type = results[0].employee_Type;
			return type;
		}
	});
}

exports.employeeauth = function(req, res) {
	
	var username = req.body.username;
	var password = req.body.password;
	
	
	if (username && password) {
		var sql = "SELECT * FROM `Team7-medical`.`employee` WHERE username = ? AND password = ?";
		var sql2 = "SELECT employee_Type FROM `Team7-medical`.`employee` WHERE employee_ID = ?";
		connection.query(sql , [username, password], function(error, results, fields) {
			
			if(error) throw error;
			// else{
			// 	connection.query(sql2,[employeeID],function(error,results,fields){
			// 		res.redirect('/dhome');
			// 	})
			// }
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.employeeID = results[0].employee_ID;
				req.session.employee_Type = results[0].employee_Type;
				if(results[0].employee_Type == "Doctor") res.redirect('/dhome');
				if(results[0].employee_Type == "Nurse") res.redirect('/nursehome');				
			} 
			else {
		res.send('Incorrect Username and/or Password!');
		console.log(results);
			}			
			res.end(); 
		});
	} else {
    res.send('Please enter Username and Password!');
		res.end();
	}
	// connection.query(sql2,[employeeID],function(error,results,fields){
	// 	if(error) throw error;
	// 	else{
	// 		if(results[0].employee_Type == "Doctor") res.redirect('/dhome');
	// 	}
	// })	
}
exports.auth = function(req, res) {
	var username = req.body.username;
    var password = req.body.password;
	if (username && password) {
		connection.query('SELECT * FROM `Team7-medical`.`patient` WHERE username = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				req.session.loggedin = true;
				req.session.username = username;
				req.session.patientID = results[0].patient_ID;
				console.log(results[0].patient_ID);
				res.redirect('/home');
			} else {
        res.send('Incorrect Username and/or Password!');
			}			
			res.end(); 
		});
	} else {
    res.send('Please enter Username and Password!');
		res.end();
	}
}
exports.dappointment = function(req,res){
	var id = req.session.employeeID;
	var sql = 'SELECT A.apointment_ID, A.Date, A.time, A.apointment_reason, A.patient_ID, Pa.name AS patientname, A.office_ID, O.adress FROM apointment AS A JOIN  office AS O ON A.office_ID = O.office_ID JOIN patient AS Pa ON A.patient_ID = Pa.patient_ID WHERE doctor_ID = ?';
	
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			res.render('employee_schedule',{userdata : results});
		}
		else{
			throw error;
		}
	});
}
exports.cancel = function(req,res){
	var id = req.body.id;
	var sql = "UPDATE `apointment` SET status = 1 WHERE apointment_ID = ?";
	
	connection.query(sql,id,function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/dappointment');
		}
	});
}

exports.employeeprescription = function(req,res){
	var id = req.session.employeeID;
	var sql = 'SELECT P.idPrescription, M.Medicine_Name, P.prescribed_by_doctor_ID, E.name, P.patient_ID, Pa.name AS patientname, P.date_prescribed, P.time_prescribed FROM prescription AS P JOIN medicine_names AS M ON P.drug_ID = M.Medicine_ID JOIN employee as E ON P.prescribed_by_doctor_ID = E.employee_ID JOIN patient as Pa ON P.patient_ID = Pa.Patient_ID WHERE P.prescribed_by_doctor_ID = 1; SELECT * FROM medicine_names;'
	connection.query(sql,id,function(error,results,fields){
		//console.log(results);
		if(results[0].length > 0){
			//console.log(results.length);
			res.render('employee_prescriptions',{userdata : results[0], medicinedata : results[1], user_ID : id});
		}
		else{
			throw error;
		}
	});
	
}

exports.submitprescription = function(req,res){
    var id = req.session.employeeID;
    var patientID = req.body.patientID;
    var drugID = req.body.drugID;
    var sql = "INSERT INTO prescription(drug_ID,perscribed_by_doctor_ID,patient_ID) VALUES (?,?,?) ";
    connection.query(sql,[drugID,id,patientID],function(error,results,fields){
        if(error) {
           res.redirect('/error2');

        }
        else{
            res.redirect('/employeeprescription');
        }
    });
}
exports.notes = function(req,res){
	var id = req.session.employeeID;
	var sql = 'SELECT H.patient_ID, Pa.name, H.date, E.name AS doctorname, H.blood_pressure, H.weight_lb, H.temperature_F, H.patient_input, H.doctors_notes, O.adress FROM `history/diagnosis` AS H JOIN patient AS Pa ON H.patient_ID = Pa.patient_ID JOIN employee AS E ON H.updated_By_Doctor_ID = E.employee_ID JOIN office AS O ON H.updated_In_Office = O.office_ID WHERE updated_By_Doctor_ID = ?;   SELECT office_ID, adress FROM `team7-medical`.office';
	connection.query(sql,id,function(error,results,fields){
		if(results[0].length > 0){
			//console.log(results);
			res.render('employee_summary',{userdata : results[0], officedata: results[1], user_ID : id});
		}
		else{
			throw error;
		}
	});

}			
exports.updatenotes = function(req,res){
	var today = new Date();
	var id = req.session.employeeID;
	var patientID = req.body.patientID;
	var location = req.body.location;
	var blood = req.body.blood;
	var weight = req.body.weight;
	var temp = req.body.temp;
	
	var pnote = req.body.pnote;
	var dnote = req.body.dnote;
	
	var sql = "INSERT INTO `history/diagnosis`(doctors_notes, patient_input, date, blood_pressure, weight_lb, temperature_F, patient_ID, updated_By_Doctor_ID, updated_In_Office) VALUES (?,?,?,?,?,?,?,?,?) ";
	connection.query(sql,[dnote,pnote,today,blood,weight,temp,patientID,id,location],function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/notes');
		}
	});
}	
	
exports.appointment = function(req,res){
	var emp = "Doctor";
	var id = req.session.patientID;
	var sql = 'SELECT A.apointment_ID, A.Date, A.time, A.apointment_reason, A.patient_ID, Pa.name AS patientname, A.doctor_ID, E.name, O.adress FROM apointment AS A JOIN patient AS Pa ON A.patient_ID = Pa.patient_ID JOIN employee AS E ON A.doctor_ID = E.employee_ID Join office AS O ON A.office_ID = O.office_ID WHERE A.patient_ID = ? ORDER BY A.date';
	var sql2 = "SELECT employee_ID, name FROM `team7-medical`.`employee` WHERE employee_Type = ?";
	var sql3 = "SELECT office_ID, adress FROM `team7-medical`.`office`";
	connection.query(sql2,[emp],function(error,rows){
		if (error) throw error;
		connection.query(sql3,function(error,rows2){
			if(error) throw error;
			connection.query(sql,id,function(error,results,fields){
				if(results.length > 0){
					console.log(rows);
					console.log(rows2);
					res.render('patient_appointment',{userdata : results, doctor : rows, office : rows2});
				}
				else{
					res.render('newpatient_appointment',{userdata : results, doctor : rows, office : rows2});
				}
		})
	})
	
		
	});
}
exports.scheduleappointment = function(req,res){
	
	var id = req.session.patientID;
	var day = req.body.day;
	
	var time = req.body.time;
	var location = req.body.location;
	var doctor = req.body.doctor;
	var notes = req.body.notes;
	var sql = "INSERT INTO `apointment`(Date, Time, apointment_reason, patient_ID, doctor_ID, office_ID) VALUES (?,?,?,?,?,?) ";
	var sql2 = "DELETE FROM `apointment` WHERE apointment_ID = ?";
	var sql3 = 'SELECT * FROM `team7-medical`.`apointment` WHERE patient_ID = ? ';
	
	if(day && time){
		connection.query(sql3,[id],function(error,results,fields){
			var GivenDate = day;
			var CurrentDate = new Date();
			GivenDate = new Date(GivenDate);
			if(GivenDate < CurrentDate){
				res.redirect('/error1');
				
			}
			else{
			var a = false;

			for(i = 0;i<results.length;i++){
			if(day == results[i].Date && time == results[i].Time){
				a= true;
				res.redirect('/error1');
				break;
			}	
			}
		}
			if(a == false){
				connection.query(sql,[day,time,notes,id,doctor,location],function(error,result,fields){
					if(error) throw error;
					else{
						
						res.redirect('/appointment');
					}
				})
			}
		
		
		});
	}
	// if(day != null){
	// 	connection.query(sql,[day,time,notes,id,doctor,location],function(error,result,fields){
	// 	if(error) throw error;
	// 	else{
	// 		res.redirect('/appointment');
	// 	}
	// })
	// }
	if(day == null){
		
		var cancelappointment = req.body.cancelappointment;
		
		connection.query(sql2,[cancelappointment],function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/appointment');
		}
	});
	
}
}
exports.history = function(req,res){
	var id = req.session.patientID
	var sql = 'SELECT H.patient_ID, Pa.name AS patientname, H.date, H.updated_By_Doctor_ID, E.name AS doctorname, H.blood_pressure, H.weight_lb, H.temperature_F, H.patient_input, H.doctors_notes, O.adress FROM `team7-medical`.`history/diagnosis` as H JOIN patient AS Pa ON H.patient_ID = Pa.patient_ID JOIN employee AS E ON H.updated_By_Doctor_ID = E.employee_ID Join Office AS O ON H.updated_In_Office = O.office_ID WHERE H.patient_ID = ? ORDER BY H.date';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			//console.log(results);
			res.render('patient_history',{userdata : results, user_ID : id});
		}
		else{
			res.redirect('/error7');
		}
	});

}			
exports.location = function(req,res){
	var id = req.session.patientID
	var sql = 'SELECT * FROM `team7-medical`.`office` ';
	connection.query(sql,function(error,results,fields){
		if(results.length > 0){
			//console.log(results);
			res.render('locationandhours',{userdata : results, user_ID : id});
		}
		else{
			throw error;
		}
	});

}			
exports.patientprescription = function(req,res){
	var id = req.session.patientID;
	var sql = 'SELECT P.idPrescription, M.Medicine_Name, E.name AS doctorname, Pa.name AS patientname, P.date_prescribed, P.time_prescribed FROM prescription AS P JOIN medicine_names AS M ON P.drug_ID = M.Medicine_ID JOIN employee AS E ON P.prescribed_by_doctor_ID = E.employee_ID JOIN patient AS Pa ON P.patient_ID = Pa.patient_ID WHERE P.patient_ID = ? ORDER BY P.date_prescribed ';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			//console.log(results);
			res.render('patient_prescription',{userdata : results, user_ID : id});
		}
		else{
			res.redirect('/error3');
		}
	});
}

exports.report1 = function(req,res){
	// console.log("***********************************************************************************");

	// console.log(req.session);
	// console.log("***********************************************************************************");
	// console.log(req.body);
	// console.log("***********************************************************************************");

	var id = req.session.employeeID;
	var patientID = req.body.patientID;
	var datefrom = req.body.datefrom.toString();
	var dateto = req.body.dateto.toString();
	// var datefrom ="2020-04-20"
	// var dateto ="2020-05-20"
	var option = req.body.option;
	console.log(option);
	var sql = "SELECT * FROM `team7-medical`.`apointment` WHERE apointment.Date >='"+datefrom+ "'AND apointment.Date <='"+dateto+"' AND patient_ID = ?";
	var sql2 = "SELECT * FROM `team7-medical`.`prescription` WHERE prescription.date_prescribed >='"+datefrom+ "'AND prescription.date_prescribed <='"+dateto+"' AND patient_ID = ?";
	if(option == "Appointment"){
	connection.query(sql,[patientID],function(error,results,fields){
		if(results.length > 0){
			
			res.render('report1', {userdata : results, user_ID : id});
				
			}
			else{
				console.log(datefrom);
				res.redirect('/error4');
			}
		});
	}

	if(option == "Prescription"){
		connection.query(sql2,[patientID],function(error,results,fields){
			if(results.length > 0){
				console.log(results);
				res.render('report2',{userdata : results});
			}
			else{
				res.redirect('/error5');
			}
		});
	}
}
exports.acctsetting = function(req,res){
	var id = req.session.patientID;
	var sql = 'SELECT * FROM `team7-medical`.`patient` WHERE patient_ID = ? ';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('patient_account_settings',{userdata : results});
		}
		else{
			throw error;
		}
	});

}

exports.employeeacctsetting = function(req,res){
	var id = req.session.employeeID;
	var sql = 'SELECT * FROM `team7-medical`.`employee` WHERE employee_ID = ? ';
	connection.query(sql,id,function(error,results,fields){
		if(results.length > 0){
			console.log(results);
			res.render('employee_account_settings',{userdata : results});
		}
		else{
			throw error;
		}
	});

}

exports.accountsetting = function(req,res){
	var id = req.session.patientID;
	var password = req.body.password;
	var name = req.body.name;
	var email = req.body.email;
	var phone = req.body.phone;
	var address = req.body.address;
	var sex = req.body.sex;
	var DOB = req.body.DOB.toString();
	var ICEname = req.body.ICEname;
	var ICEnumber = req.body.ICEnumber;
	console.log(req.body);
	var sql = "UPDATE patient SET name = ?, DOB=?, password =?,phone_number=?, sex = ?, adress=?, person_ICE=?, phone_ICE=?, email=? WHERE patient_ID = ?";
	connection.query(sql,[name,DOB,password,phone,sex,address,ICEname,ICEnumber,email,id],function(error,results,fields){
		if(error) throw error;
		else{
			res.redirect('/home');
			//res.send("Successfully update your account");
		}
	});

}
exports.employeeaccountsetting = function(req,res){
	var id = req.session.employeeID;
	var password = req.body.password;
	var name = req.body.name;
	var email = req.body.email;
	var phone = req.body.phone;
	var address = req.body.address;
	var sex = req.body.sex;
	
	var ICEname = req.body.ICEname;
	var ICEnumber = req.body.ICEnumber;
	
	var sql = "UPDATE employee SET name = ?, password =?,phone_Cell=?, sex = ?, adress=?, person_ICE=?, phone_ICE=?, email=? WHERE employee_ID = ?";
	connection.query(sql,[name,password,phone,sex,address,ICEname,ICEnumber,email,id],function(error,results,fields){
		if(error) throw error;
		else{
			
			res.send("Successfully update your account" + " ------- " + "Please press backwards(arrow) twice to return to the employee menu");
		}
	});

}

exports.doctorreport = function(req,res){
	var doctorID = req.body.doctorID;
	var day = req.body.day;
	var sql = "SELECT COUNT(*) as total FROM `team7-medical`.`apointment` WHERE doctor_ID = ? AND Date = ?";
	var sql2 = "SELECT * FROM `team7-medical`.`apointment` WHERE doctor_ID = ? AND Date = ? ";
	connection.query(sql,[doctorID,day],function(error,results,fields){
		if(error) throw error;
		connection.query(sql2,[doctorID,day],function(error,results2,fields){
			if(results2.length > 0){
				res.render("report3",{userdata:results2,totaldata:results})
			}
			else{
				res.redirect('/error6');
			}
		})
	})
}