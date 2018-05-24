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
        async addCountry(stub , args, thisClass) {
            if (args.length != 1 ) {
                throw new Error(" Incorrect no. of the arguments, Expecting 1 Arguments ")
            }

            let count = await stub.getState("count");
            let count1 = parseInt(count.toString())+1;//converting into integer
            let countryId = ''+count1;
            let date = new Date();
            let currDate = date.getDate()+"/"+date.getMonth()+"/"+date.getFullYear();
            let countryName = args[0];
            let channelName1 = "channelwho"+countryName.toLowerCase();
            let channelName2 = "channel"+countryName.toLowerCase();
            let regSince = currDate;
            let status = "inactive";
            let Details = { countryId : countryId , countryName : countryName , regSince: regSince , channelName1: channelName1 , channelName2: channelName2, status: status, peer0port: "", peer1port: "", reqport: "" };
            await stub.putState(countryId, Buffer.from(JSON.stringify(Details)));
            await stub.putState("count", Buffer.from(count1.toString()));//updating the count in ledger
            console.info(" country added in ledger ");
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


        async queryCountry(stub, args, thisClass) {
            if (args.length != 1) {
            throw new Error(" Incorrect number of arguments. Expecting Id to query ");
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


        async recentRegisteredCountries(stub, args, thisClass) {

            let allResult = [];
            let count = await stub.getState("count");
            let count1 = parseInt(count.toString());//converting into integer
            let k=0;
            if(count1 < 3){
                k=0;
            }
            else{
                k = count1-3;
            }
            let i;
            for(i = count1; i > k; i--){
            let jsonRes = {};
            let detailsAsbytes = await stub.getState(''+i);
            jsonRes = JSON.parse(detailsAsbytes.toString());
                allResult.push(jsonRes);
            }
            
            return Buffer.from(JSON.stringify(allResult));
    
    }

   
	async updateStatus(stub , args, thisClass) {
	if (args.length != 2 ) {
		throw new Error(" Incorrect no. of the arguments, Expecting 2 Arguments ")
	}

	let countryid = args[0];
	let status = args[1];

	let detail1bytes = await stub.getState(args[0]);
	if (!detail1bytes || !detail1bytes.toString()) {
		throw new Error("Country  does not exist");
	}

	let   countryDetail1 = JSON.parse(detail1bytes); //unmarshal
			countryDetail1.status = status;

	await stub.putState(countryid, Buffer.from(JSON.stringify(countryDetail1)));     
		
	//return Buffer.from(JSON.stringify(countryDetail1));
	}

	async queryStatus(stub , args, thisClass) {
	if (args.length != 1 ) {
	throw new Error(" Incorrect no. of the arguments, Expecting 1 Arguments ")
	}

	let countryid = args[0];

	let detail2bytes = await stub.getState(countryid);
	if (!detail2bytes || !detail2bytes.toString()) {
		throw new Error("Country  does not exist");
	}

	let countryDetail2 = JSON.parse(detail2bytes); //unmarshal

	return Buffer.from(countryDetail2.status);

	}

async updatePorts(stub , args, thisClass) {
	if (args.length != 4 ) {
		throw new Error(" Incorrect no. of the arguments, Expecting 4 Arguments ")
	}

	let countryid = args[0];
	let port1 = args[1];
    let port2 = args[2];
    let port3 = args[3];

	let detail3bytes = await stub.getState(args[0]);
	if (!detail3bytes || !detail3bytes.toString()) {
		throw new Error("Country  does not exist");
	}

	let   countryDetail3 = JSON.parse(detail3bytes); //unmarshal
			countryDetail3.peer0port = port1;
            countryDetail3.peer1port = port2;
            countryDetail3.reqport = port3;

	await stub.putState(countryid, Buffer.from(JSON.stringify(countryDetail3)));     
		
	//return Buffer.from(JSON.stringify(countryDetail3));
	}

	async queryPorts(stub , args, thisClass) {
	if (args.length != 1 ) {
	throw new Error(" Incorrect no. of the arguments, Expecting 1 Arguments ")
	}

	let countryid = args[0];

	let detail4bytes = await stub.getState(countryid);
	if (!detail4bytes || !detail4bytes.toString()) {
		throw new Error("Country  does not exist");
	}

	let countryDetail4 = JSON.parse(detail4bytes); //unmarshal

    let port = '{ "peer0port": '+ countryDetail4.peer0port + ', "peer1port": '+ countryDetail4.peer1port + ', "reqport": '+ countryDetail4.reqport +' }'
	return Buffer.from(port);

	}



	}

shim.start(new WHOChaincode());
