"use strict";
const shim = require("fabric-shim");
const util = require("util");


var WHOChaincode = class {
    async Init(stub) {
		let ret = stub.getFunctionAndParameters();
        	let args = ret.params;
        	let count = args[0];
        	let value = args[1];
        	try {
           	await stub.putState(count, Buffer.from(value));
           	return shim.success();
       	        } catch (err) {
           	return shim.error(err);
       		}
        	console.info(" Instantiated  WHOChaincode Chaincode ");
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

    async addCountry(stub , args, thisClass) {
        

        	if (args.length != 6 ) {
            	throw new Error(" Incorrect no. of the arguments,  Expecting 6 Arguments ")
       		 }

        	let date = new Date();
        	let currDate = date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
        	let countryName = args[0];
        	let address = args[1];
        	let zipcode = args[2];
        	let city = args[3];
        	let phoneNo = args[4];
            let countryId = args[5];
        	let regSince = currDate;
        
        	let Details = { countryId : countryId , countryName : countryName , address : address , zipcode : zipcode , city : city , phoneNo : phoneNo, regSince: regSince};
        
        	await stub.putState(countryId, Buffer.from(JSON.stringify(Details)));
        	console.info(" Country added in ledger ");
    	}


        async updateCountry(stub , args, thisClass) {
        

        	if (args.length != 6 ) {
            	throw new Error(" Incorrect no. of the arguments,  Expecting 6 Arguments ")
       		 }

        	let countryName = args[0];
        	let address = args[1];
        	let zipcode = args[2];
        	let city = args[3];
        	let phoneNo = args[4];
            let countryId = args[5];
        	//let regSince = currDate;
        
        	let Details = { countryId : countryId , countryName : countryName , address : address , zipcode : zipcode , city : city , phoneNo : phoneNo};
        
        	await stub.putState(countryId, Buffer.from(JSON.stringify(Details)));
        	console.info(" Country updated in ledger ");
    	}	


    async queryCountry(stub, args, thisClass) {
       		if (args.length != 1) {
      		throw new Error(" Incorrect number of arguments. Expecting name of the Id to query ");
    	        }
    		let countryId = args[0];
    
    		let detailsAsbytes = await stub.getState(countryId); 
   		if (!detailsAsbytes.toString()) {
      		let jsonResp = {};
      		jsonResp.Error =  " CountryId does not exist: " + countryId;
      		throw new Error(JSON.stringify(jsonResp));
    	}
    		console.info("=======================================");
    		console.log(detailsAsbytes.toString());
    		console.info("=======================================");
    		return detailsAsbytes;
    	}

	async queryAllCountries(stub, args, thisClass) {

	        let allResult = [];
        	let count = await stub.getState("count");
        	let count1 = parseInt(count.toString());//converting into integer

    		let i = 1;
    		for(i = 1; i <= count1; i++){
        	let jsonRes = {};
        	let detailsAsbytes = await stub.getState(''+i);
        	jsonRes = JSON.parse(detailsAsbytes.toString());
            allResult.push(jsonRes);
        	
    	}
            return Buffer.from(JSON.stringify(allResult));
  
  	}

	}

shim.start(new WHOChaincode());
