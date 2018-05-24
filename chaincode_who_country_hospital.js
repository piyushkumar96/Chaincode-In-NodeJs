"use strict";
const shim = require("fabric-shim");
const util = require("util");

var WHOChaincode = class {
    async Init(stub) {
        let ret = stub.getFunctionAndParameters();
        let args = ret.params;
        let count = args[0];
        let value = args[1];
        let recepient = args[2];
        let value2 = args[3];
        let donor = args[4];
        let value3 = args[5];
        let transplant = args[6];
        let value4 = args[7];
    try {
        await stub.putState(count, Buffer.from(value));
        await stub.putState(recepient, Buffer.from(value2));
        await stub.putState(donor, Buffer.from(value3));
        await stub.putState(transplant, Buffer.from(value4));
        return shim.success();
    } catch (err) {
        return shim.error(err);
	}
        console.info(" Instantiated WHOChaincode Chaincode ");
        return shim.success();
}
   
     async Invoke(stub) {
        let arg = stub.getFunctionAndParameters();
        console.info(arg);
        let method = this[arg.fcn];
        if(!method) {
        console.error("No Function Of Name: "+ arg.fcn + " found");
        throw new Error(" Received unknown function " + arg.fcn + " invocation");
        }
        try {
        let payload = await method(stub, arg.params, this);
        return shim.success(payload);
        } catch (err) {
        console.log(err);
        return shim.error(err);
    }
}
  
   //===================ADD HOSPITAL======================== 

    async addHospital(stub , args, thisClass) {
        if (args.length != 9 ) {
        	throw new Error(" Incorrect no. of the arguments, Expecting 9 Arguments ")
    	}
	
	let transplant_count = "0";
	let donor_count = "0";
	let recepient_count = "0";

        let countryId = args[8];
        let count = await stub.getState("count");
        let count1 = parseInt(count.toString())+1;//converting into integer
        let hospitalId = countryId + "-H"+count1;
        let countryName = args[0];
        let hospitalName = args[1];
        let regSince = args[2];
        let address = args[3];
        let zipCode = args[4];
        let city = args[5];
        let state = args[6];
        let phoneNo = args[7]

        let Details = { hospitalId : hospitalId , countryName : countryName , hospitalName : hospitalName , regSince : regSince , address : address , zipCode : zipCode, city : city, state : state, phoneNo : phoneNo};
await stub.putState(hospitalId, Buffer.from(JSON.stringify(Details)));
await stub.putState("count", Buffer.from(count1.toString()));//updating the count in ledger
await stub.putState(hospitalId+"T", Buffer.from(transplant_count));
        await stub.putState(hospitalId+"D", Buffer.from(donor_count));
        await stub.putState(hospitalId+"R", Buffer.from(recepient_count));
        console.info(" Hospital added in ledger ");
        return Buffer.from(hospitalId);
    }

//===============================END ADD HOSPITAL==========================================

//===============================START UPDATE HOSPITAL ====================================

    async updateHospital(stub , args, thisClass) {
        if (args.length != 9 ) {
        throw new Error(" Incorrect no. of the arguments, Expecting 9 Arguments ")
    }

        let countryName = args[0];
        let hospitalName = args[1];
        let regSince = args[2];
        let address = args[3];
        let zipCode = args[4];
        let city = args[5];
        let state = args[6];
        let phoneNo = args[7];
        let hospitalId = args[8]
        let Details = { hospitalId : hospitalId , countryName : countryName , hospitalName : hospitalName , regSince : regSince , address : address , zipCode : zipCode, city : city, state : state, phoneNo : phoneNo};
await stub.putState(hospitalId, Buffer.from(JSON.stringify(Details)));
        console.info(" Hospital Details updated in ledger ");
    }


//==================================END UPDATE HOSPITAL======================================


//==================================START QUERY HOSPITAL=====================================

    async queryHospital(stub, args, thisClass) {
        if (args.length != 1) {
        throw new Error(" Incorrect number of arguments. Expecting id of the country to query ");
        }

        let countryId = args[0];
        let allResult = [];
        let count = await stub.getState("count");
        let count1 = parseInt(count.toString());//converting into integer

        let i = 1;
        for(i = 1; i <= count1; i++){
            let jsonRes = {};
            let detailsAsbytes = await stub.getState(countryId+"-H"+i);
            jsonRes = JSON.parse(detailsAsbytes.toString());
            allResult.push(jsonRes);
            
        }
        
        return Buffer.from(JSON.stringify(allResult));
 
    }

//==========================END QUERY HOSPITAL==============================================

// ========================= ADD DONOR / RECEPIENT ========================================= 
    async addDonorOrRecepient(stub , args, thisClass) {

        if (args.length != 31 ) {
        throw new Error(" Incorrect no. of the arguments, Expecting 31 Arguments ")
        }
//PersonalInfo 
        let typeOfUser = args[0];
        let firstName = args[1];
        let middleName = args[2];
        let lastName = args[3];
        let relation = args[4];
        let dateOfBirth = args[5];
        let age = args[6];
        let gender = args[7]; 
        let personalMobileNo = args[8]
        let bloodGroup = args[9]
        let emailIdPersonal = args[10]
        //endPersonalinfo
//IdentificationInfo
        let identificationType = args[11];
        let identificationCard = args[12];//endIdentificationInfo
//AddressInfo
        let addressLine1 = args[13];
        let addressLine2 = args[14];
        let district = args[15];
        let state = args[16];
        let country = args[17];
        let pinCode = args[18];
        let phoneNumber = args[19];//endAddressInfo
//emergencyContactInfo
        let fullNameEmergencyConct = args[20];
        let mobileNoEmergencyConct = args[21];
        let emailIdEmergencyContct = args[22];
        let relationEmergencyConct = args[23];
        let fullAddressEmergencyConct = args[24];
        let districtEmergencyConct = args[25];
        let stateEmergencyConct = args[26];
        let countryEmergencyConct = args[27];
        let pincodeEmergencyConct = args[28];//endEmergencyContactlInfo
//organforDonationOrAcceptance
        let organStatus = args[29];
        let hospitalId = args[30];
        

//adding recepient
        if(typeOfUser.toLowerCase()=="recepient"){
        let recepient = await stub.getState("recepient");
        let recepient1 = parseInt(recepient.toString())+1;//convertingnto integer
	
	let recepientHospital = await stub.getState(hospitalId+"R");
        let recepientHospital1 = parseInt(recepientHospital.toString())+1;//convertingnto integer

        let recepientId = args[30]+"-R"+recepientHospital1;

        let recepientDetails= {recepientId:recepientId,typeOfUser:typeOfUser,firstName:firstName,middleName:middleName,lastName:lastName,relation:relation,dateOfBirth:dateOfBirth,age:age,gender:gender,personalMobileNo:personalMobileNo,bloodGroup:bloodGroup,emailIdPersonal:emailIdPersonal,identificationType:identificationType,identificationCard:identificationCard,addressLine1:addressLine1,addressLine2:addressLine2,district:district,state:state,country:country,pinCode:pinCode,phoneNumber:phoneNumber,fullNameEmergencyConct:fullNameEmergencyConct,mobileNoEmergencyConct:mobileNoEmergencyConct,emailIdEmergencyContct:emailIdEmergencyContct,relationEmergencyConct:relationEmergencyConct,fullAddressEmergencyConct:fullAddressEmergencyConct,districtEmergencyConct:districtEmergencyConct,stateEmergencyConct:stateEmergencyConct,countryEmergencyConct:countryEmergencyConct,pincodeEmergencyConct:pincodeEmergencyConct,organStatus:organStatus};
        await stub.putState(recepientId, Buffer.from(JSON.stringify(recepientDetails)));
        await stub.putState("recepient", Buffer.from(recepient1.toString()));//updatingthe count in ledger
	await stub.putState(hospitalId+"R", Buffer.from(recepientHospital1.toString()));//updatingthe count in ledger
        console.info("recepient Added in Ledger");
        }
//adding donor
        if(typeOfUser.toLowerCase()=="donor"){
        let donor = await stub.getState("donor");
        let donor1 = parseInt(donor.toString())+1;//converting intointeger

	let donorHospital = await stub.getState(hospitalId+"D");
        let donorHospital1 = parseInt(donorHospital.toString())+1;//converting intointeger

        let donorId = args[30]+"-D"+donorHospital1;

        
        let donorDetails={donorId:donorId,typeOfUser:typeOfUser,firstName:firstName,middleName:middleName,lastName:lastName,relation:relation,dateOfBirth:dateOfBirth,age:age,gender:gender,personalMobileNo:personalMobileNo,bloodGroup:bloodGroup,emailIdPersonal:emailIdPersonal,identificationType:identificationType,identificationCard:identificationCard,addressLine1:addressLine1,addressLine2:addressLine2,district:district,state:state,country:country,pinCode:pinCode,phoneNumber:phoneNumber,fullNameEmergencyConct:fullNameEmergencyConct,mobileNoEmergencyConct:mobileNoEmergencyConct,emailIdEmergencyContct:emailIdEmergencyContct,relationEmergencyConct:relationEmergencyConct,fullAddressEmergencyConct:fullAddressEmergencyConct,districtEmergencyConct:districtEmergencyConct,stateEmergencyConct:stateEmergencyConct,countryEmergencyConct:countryEmergencyConct,pincodeEmergencyConct:pincodeEmergencyConct,organStatus:organStatus};
        await stub.putState(donorId, Buffer.from(JSON.stringify(donorDetails)));
        await stub.putState("donor", Buffer.from(donor1.toString()));//updating the count in ledger
	await stub.putState(hospitalId+"D", Buffer.from(donorHospital1.toString()));//updating the count in ledger
        console.info("donor Added in Ledger");
        }
              console.info("DONOR/RECEPIENT Added in Ledger successfully");
    }
//=======================================ADD DONOR AND RECIPIENT END======================

//=======================================START UPDATE DONOR/RECEPIENT=====================

async updateDonorOrRecepient(stub , args, thisClass) {

      if (args.length != 31 ) {
        throw new Error(" Incorrect no. of the arguments, Expecting 31 Arguments ")
        }
//PersonalInfo 
        let typeOfUser = args[0];
        let firstName = args[1];
        let middleName = args[2];
        let lastName = args[3];
        let relation = args[4];
        let dateOfBirth = args[5];
        let age = args[6];
        let gender = args[7]; 
        let personalMobileNo = args[8]
        let bloodGroup = args[9]
        let emailIdPersonal = args[10]
        //endPersonalinfo
//IdentificationInfo
        let identificationType = args[11];
        let identificationCard = args[12];//endIdentificationInfo
//AddressInfo
        let addressLine1 = args[13];
        let addressLine2 = args[14];
        let district = args[15];
        let state = args[16];
        let country = args[17];
        let pinCode = args[18];
        let phoneNumber = args[19];//endAddressInfo
//emergencyContactInfo
        let fullNameEmergencyConct = args[20];
        let mobileNoEmergencyConct = args[21];
        let emailIdEmergencyContct = args[22];
        let relationEmergencyConct = args[23];
        let fullAddressEmergencyConct = args[24];
        let districtEmergencyConct = args[25];
        let stateEmergencyConct = args[26];
        let countryEmergencyConct = args[27];
        let pincodeEmergencyConct = args[28];//endEmergencyContactlInfo
//organforDonationOrAcceptance
        let organStatus = args[29];
        let updateId = args[30];

        if(typeOfUser.toLowerCase()=="donor"){
            let updateDetails= {donorId:updateId,typeOfUser:typeOfUser,firstName:firstName,middleName:middleName,lastName:lastName,relation:relation,dateOfBirth:dateOfBirth,age:age,gender:gender,personalMobileNo:personalMobileNo,bloodGroup:bloodGroup,emailIdPersonal:emailIdPersonal,identificationType:identificationType,identificationCard:identificationCard,addressLine1:addressLine1,addressLine2:addressLine2,district:district,state:state,country:country,pinCode:pinCode,phoneNumber:phoneNumber,fullNameEmergencyConct:fullNameEmergencyConct,mobileNoEmergencyConct:mobileNoEmergencyConct,emailIdEmergencyContct:emailIdEmergencyContct,relationEmergencyConct:relationEmergencyConct,fullAddressEmergencyConct:fullAddressEmergencyConct,districtEmergencyConct:districtEmergencyConct,stateEmergencyConct:stateEmergencyConct,countryEmergencyConct:countryEmergencyConct,pincodeEmergencyConct:pincodeEmergencyConct,organStatus:organStatus};
	await stub.putState(updateId, Buffer.from(JSON.stringify(updateDetails)));        
	}
        
        if(typeOfUser.toLowerCase()=="recepient"){
            let updateDetails= {recepientId:updateId,typeOfUser:typeOfUser,firstName:firstName,middleName:middleName,lastName:lastName,relation:relation,dateOfBirth:dateOfBirth,age:age,gender:gender,personalMobileNo:personalMobileNo,bloodGroup:bloodGroup,emailIdPersonal:emailIdPersonal,identificationType:identificationType,identificationCard:identificationCard,addressLine1:addressLine1,addressLine2:addressLine2,district:district,state:state,country:country,pinCode:pinCode,phoneNumber:phoneNumber,fullNameEmergencyConct:fullNameEmergencyConct,mobileNoEmergencyConct:mobileNoEmergencyConct,emailIdEmergencyContct:emailIdEmergencyContct,relationEmergencyConct:relationEmergencyConct,fullAddressEmergencyConct:fullAddressEmergencyConct,districtEmergencyConct:districtEmergencyConct,stateEmergencyConct:stateEmergencyConct,countryEmergencyConct:countryEmergencyConct,pincodeEmergencyConct:pincodeEmergencyConct,organStatus:organStatus};
        await stub.putState(updateId, Buffer.from(JSON.stringify(updateDetails)));
	}

        
        
        console.info("Records UPDATED in Ledger successfully");
    }
// =================================END UPDATE DONOR / RECEPIENT====================================

// ================================ADD TRANSPLANT START=============================================

async addTransplant(stub , args, thisClass) {

        let typeOfOrgan = args[0];
        let dateOfTransplant = args[1];
        let HospitalName = args[2];
        let city = args[3];
        let status = args[4];
//Donor Info
        let donorName = args[5];
        let donordateOfBirth = args[6];
        let donorage = args[7];
        let donormobile = args[8]; 
        let donorfullAddress = args[9];
        let donorcity = args[10];
//Recepient Info
        let recepientName = args[11];
        let recepdateOfBirth = args[12];
        let recepage = args[13];
        let recepmobile = args[14]; 
        let recepfullAddress = args[15];
        let recepcity = args[16]; 
        let hospitalId = args[17]; 
     
        let transplant = await stub.getState("transplant");
        let transplant1 = parseInt(transplant.toString())+1;//converting into integer

	let transplantHospital = await stub.getState(hospitalId+"T");
        let transplantHospital1 = parseInt(transplantHospital.toString())+1;//converting into integer

        let transplant1Id = hospitalId+"-T"+transplantHospital1;
        let transplantDetails= {transplantId:transplant1Id, typeOfOrgan:typeOfOrgan , dateOfTransplant :dateOfTransplant , HospitalName:HospitalName , city:city , status:status , donorName:donorName , donordateOfBirth: donordateOfBirth , donorage:donorage , donormobile:donormobile , donorfullAddress:donorfullAddress , donorcity:donorcity, recepientName:recepientName , recepdateOfBirth:recepdateOfBirth ,recepage:recepage, recepmobile:recepmobile ,recepfullAddress:recepfullAddress  , recepcity:recepcity };
        await stub.putState(transplant1Id, Buffer.from(JSON.stringify(transplantDetails)));
        await stub.putState("transplant", Buffer.from(transplant1.toString()));//updating the count in ledger
	await stub.putState(hospitalId+"T", Buffer.from(transplantHospital1.toString()));//updating the count in ledger
        console.info("transplant Added in Ledger");
        console.info("Records Added in Ledger successfully");

    }

//=================================END ADD TRANSPARENT =================================================

//=================================START UPDATE TRANSPLANT==============================================

	async updateTransplant(stub , args, thisClass) {
        	let typeOfOrgan = args[0];
        	let dateOfTransplant = args[1];
       		let HospitalName = args[2];
        	let city = args[3];
        	let status = args[4];
  //Donor Info
        	let donorName = args[5];
        	let donordateOfBirth = args[6];
        	let donorage = args[7];
        	let donormobile = args[8]; 
        	let donorfullAddress = args[9];
        	let donorcity = args[10];
  //Recepient Info
        	let recepientName = args[11];
        	let recepdateOfBirth = args[12];
        	let recepage = args[13];
        	let recepmobile = args[14]; 
        	let recepfullAddress = args[15];
        	let recepcity = args[16]; 
        	let transplantId = args[17];      
        
      
         	let transplantDetails= {transplantId:transplantId, typeOfOrgan:typeOfOrgan , dateOfTransplant :dateOfTransplant , HospitalName:HospitalName , city:city , status:status , donorName:donorName , donordateOfBirth: donordateOfBirth , donorage:donorage , donormobile:donormobile , donorfullAddress:donorfullAddress , donorcity:donorcity , recepientName:recepientName , recepdateOfBirth:recepdateOfBirth ,recepage:recepage,recepmobile:recepmobile, recepfullAddress:recepfullAddress  , recepcity:recepcity };
            	await stub.putState(transplantId, Buffer.from(JSON.stringify(transplantDetails)));
            	console.info("transplant Updated in Ledger");
        	console.info("Records Updated in Ledger successfully");

    }

//==============================END UPDATE TRANSPLANT====================================================

//=============================START QUERY TRANSPLANT====================================================

	async queryTransplant(stub, args, thisClass) {

        	if (args.length != 1) {
        	throw new Error(" Incorrect number of arguments. Expecting name of the Id to query ");
        }
        	let hospitalId = args[0];
            let allResult = [];
        	let count = await stub.getState(hospitalId+"T");
        	let count1 = parseInt(count.toString());
        	let i = 1;
        	for(i = 1; i <= count1; i++){
        	let jsonRes = {};
        	let detailsAsbytes = await stub.getState(hospitalId+"-T"+i);
        	jsonRes = JSON.parse(detailsAsbytes.toString());
            allResult.push(jsonRes);
        	
        }
        	
            return Buffer.from(JSON.stringify(allResult));
    }

//=====================END QUERY TRANSPLANT=============================================================

//====================START QUERY DONOR / RECEPIENT ====================================================

	async queryDonor(stub, args, thisClass) {
        	if (args.length != 1) {
        	throw new Error(" Incorrect number of arguments.");
                }
        	let count1;
        	let hospitalId = args[0];
        	let count = await stub.getState(hospitalId+"D");
        	count1 = parseInt(count.toString());//converting into integer
                let allResult = [];
        	for(let i = 1; i <= count1; i++){
            	let jsonRes = {};
            	let detailsAsbytes = await stub.getState(hospitalId+"-D"+i);
            	jsonRes = JSON.parse(detailsAsbytes.toString());
                allResult.push(jsonRes);
            	
            }
            return Buffer.from(JSON.stringify(allResult));
 
    }



    async queryRecepient(stub, args, thisClass) {
        	if (args.length != 1) {
        	throw new Error(" Incorrect number of arguments.");
                }
        	let count1;
        	let hospitalId = args[0];
        	let count = await stub.getState(hospitalId+"R");
        	count1 = parseInt(count.toString());//converting into integer
                let allResult = [];
        	for(let i = 1; i <= count1; i++){
            	let jsonRes = {};
            	let detailsAsbytes = await stub.getState(hospitalId+"-R"+i);
            	jsonRes = JSON.parse(detailsAsbytes.toString());
                allResult.push(jsonRes);
            	
            }
                return Buffer.from(JSON.stringify(allResult));
 
    }
//==================END QUERY / DONOR =============================================================== 


       async queryHospitalById(stub, args, thisClass) {
       		if (args.length != 1) {
      		throw new Error(" Incorrect number of arguments. Expecting Id to query ");
    	        }
    		let hospitalId = args[0];
    
    		let detailsAsbytes = await stub.getState(hospitalId); 
   		if (!detailsAsbytes.toString()) {
      		let jsonResp = {};
      		jsonResp.Error =  " hospitalId does not exist: " + hospitalId;
      		throw new Error(JSON.stringify(jsonResp));
    	        }
    		console.info("=======================================");
    		console.log(detailsAsbytes.toString());
    		console.info("=======================================");
    		return detailsAsbytes;
    	}

        async queryDonorById(stub, args, thisClass) {
       		if (args.length != 1) {
      		throw new Error(" Incorrect number of arguments. Expecting Id to query ");
    	        }
    		let donorId = args[0];
    
    		let detailsAsbytes = await stub.getState(donorId); 
   		if (!detailsAsbytes.toString()) {
      		let jsonResp = {};
      		jsonResp.Error =  " donorId does not exist: " + donorId;
      		throw new Error(JSON.stringify(jsonResp));
    	        }
    		console.info("=======================================");
    		console.log(detailsAsbytes.toString());
    		console.info("=======================================");
    		return detailsAsbytes;
    	}

        async queryRecepientById(stub, args, thisClass) {
       		if (args.length != 1) {
      		throw new Error(" Incorrect number of arguments. Expecting Id to query ");
    	        }
    		let recepientId = args[0];
    
    		let detailsAsbytes = await stub.getState(recepientId); 
   		if (!detailsAsbytes.toString()) {
      		let jsonResp = {};
      		jsonResp.Error =  " recepientId does not exist: " + recepientId;
      		throw new Error(JSON.stringify(jsonResp));
    	        }
    		console.info("=======================================");
    		console.log(detailsAsbytes.toString());
    		console.info("=======================================");
    		return detailsAsbytes;
    	}

        async queryTransplantById(stub, args, thisClass) {
       		if (args.length != 1) {
      		throw new Error(" Incorrect number of arguments. Expecting Id to query ");
    	        }
    		let transplantId = args[0];
    
    		let detailsAsbytes = await stub.getState(transplantId); 
   		if (!detailsAsbytes.toString()) {
      		let jsonResp = {};
      		jsonResp.Error =  " transplantId does not exist: " + transplantId;
      		throw new Error(JSON.stringify(jsonResp));
    	        }
    		console.info("=======================================");
    		console.log(detailsAsbytes.toString());
    		console.info("=======================================");
    		return detailsAsbytes;
    	}

/////////////////////////////////////////Hospital Specific counts////////////////////////////////////////////////////////////////////
        async queryCount(stub, args, thisClass) {

        	if (args.length != 1) {
        	throw new Error(" Incorrect number of arguments. Expecting name of the Id to query ");
                }
        	let hospitalId = args[0];
                let allResult = "{";
        	let countTransplant = await stub.getState(hospitalId+"T");
                let countRecepient = await stub.getState(hospitalId+"R");
                let countDonor = await stub.getState(hospitalId+"D");
        	let countTransplant1 = countTransplant.toString();
                let countRecepient1 = countRecepient.toString();
                let countDonor1 = countDonor.toString();
                allResult += '"countT":'+countTransplant1+',"countR":'+countRecepient1+',"countD":'+countDonor1+'}';
            
                return Buffer.from(allResult);
        }


////////////////////////////////////////country specific counts///////////////////////////////////////////////////////////

        async queryCountryCount(stub, args, thisClass) {

                let allResult = "{";
        	let CountT = await stub.getState("transplant");
                let CountR = await stub.getState("recepient");
                let CountD = await stub.getState("donor");
                let CountH = await stub.getState("count"); //////////////////hospital count
        	let CountT1 = CountT.toString();
                let CountR1 = CountR.toString();
                let CountD1 = CountD.toString();
                let CountH1 = CountH.toString();
                allResult += '"countT":'+CountT1+',"countR":'+CountR1+',"countD":'+CountD1+',"countH":'+CountH1+'}';
            
                return Buffer.from(allResult);
        }

         async totalTransplantCount(stub, args, thisClass) {

                let id = args[0];
                let result = [];
                let countHos = await stub.getState("count");
                let countHos1 = parseInt(countHos.toString());//converting into integer
                for(let k=1;k<=countHos1;k++){
                        let str = "";
                        let hospId = id + "-H"+k;
                        let transId = id + "-H"+k+"T"; 
                        let cT = await stub.getState(transId);
                        let cT1 = cT.toString();
                        str += '{"id":"'+hospId+'","countT":"'+cT1+'"}';
                        let str1 = JSON.parse(str);
                        result.push(str1);
                }
                return Buffer.from(JSON.stringify(result));
        }

        async getHospitalName(stub , args, thisClass) {
                if (args.length != 1 ) {
                        throw new Error(" Incorrect no. of the arguments, Expecting 1 Arguments ")
                }

                let hospitalid = args[0];

                let detail1bytes = await stub.getState(args[0]);
                if (!detail1bytes || !detail1bytes.toString()) {
                        throw new Error("Hospital  does not exist");
                }

                let   hospitalDetail1 = JSON.parse(detail1bytes); //unmarshal
                return Buffer.from(hospitalDetail1.hospitalName);

        }
            


}
shim.start(new WHOChaincode());
