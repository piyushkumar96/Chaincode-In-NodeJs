"use strict";
const shim = require("fabric-shim");
const util = require("util");

var TrackChaincode = class {

    async Init(stub) {
        console.info(" Instantiated  TrackChaincode Chaincode ");
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

    async addOrder(stub , args, thisClass) {
        if (args.length != 4 ) {
            throw new Error(" Incorrect no. of the arguments,  Expecting 4 Arguments ")
        }

        if (args[0].length <= 0) {
            throw new Error(" 1st argument must be a non-empty string ");
        }
        if (args[1].length <= 0) {
            throw new Error(" 2nd argument must be a non-empty string ");
        }
        if (args[2].length <= 0) {
            throw new Error(" 3rd argument must be a non-empty string" );
        }
        if (args[3].length <= 0) {
            throw new Error(" 4th argument must be a non-empty string ");
        }
        let ordid = args[0];
        let custname = args[1];
        let quan = args[2];
        let orddate = args[3];
        let daterfc = args[3];
        
        let Order = { ordId : ordid , custName : custname , ordDate : orddate, recDate : "NA", status : "0", manufacturer : { quantity : quan , drfc : daterfc, dnts : "NA"}, shipper : { dcbs : "NA", dntl : "NA"}, logistic : { dcbl : "NA", ddtc : "NA"}  };
        
        await stub.putState(ordid, Buffer.from(JSON.stringify(Order)));
        console.info(" Order added in ledger ");
    }

    async queryDetails(stub, args, thisClass) {
        if (args.length != 1) {
      throw new Error(" Incorrect number of arguments. Expecting name of the OrderId to query ");
    }
    let ordid = args[0];
    ordid = ordid.substr(2,);
    
    let orderAsbytes = await stub.getState(ordid); 
    if (!orderAsbytes.toString()) {
      let jsonResp = {};
      jsonResp.Error =  " OrderId does not exist: " + ordid;
      throw new Error(JSON.stringify(jsonResp));
    }
    console.info("=======================================");
    console.log(orderAsbytes.toString());
    console.info("=======================================");
    return orderAsbytes;
    }

    async updateDate(stub, args, thisClass) {
        
        if (args.length != 3) {
           throw new Error(" Incorrect number of arguments. Expecting name of the OrderId and Holder to query ");
        }
        let Orderid = args[0];
        let holder = args[1];
        
        if ((holder == "cisco") && (args.length != 3))  {
             throw new Error("@@@@@@@@@@@@@@@@@@@  Incorrect no. of arguments, Expecting 3 argument  @@@@@@@@@@@@@@@@@@@");
        } 

        if ((holder == "partner") && (args.length != 4))  {
             throw new Error("@@@@@@@@@@@@@@@@@@@  Incorrect no. of arguments, Expecting 4 argument  @@@@@@@@@@@@@@@@@@@");
        } 

        if ((holder == "carrier") && (args.length != 5))  {
             throw new Error("@@@@@@@@@@@@@@@@@@@  Incorrect no. of arguments, Expecting 5 argument  @@@@@@@@@@@@@@@@@@@");
        } 

        let value1 = "" ;
        let value2 = "";
        let value3 = "";

        if (args[1] == "cisco") {
            value1 = args[2];
        } else if (args[1] == "partner") {
            value1 = args[2];
            value2 = args[3];
        } else {
            value1 = args[2];
            value2 = args[3];
            value3 = args[4];
        }
        
        let orderAsBytes = await stub.getState(Orderid);
        if (!orderAsBytes || !orderAsBytes.toString()) {
            throw new Error("Order does not exist");
        }
        let Order = {};
        try {
           // var err = new Error("Failed to Marshal the OrderBytes get ledger")
            Order = JSON.parse(orderAsBytes.toString()); //unmarshal
        } catch (err) {
        let jsonResp = {};
        jsonResp.error = 'Failed to decode JSON of: ' + Orderid;
            throw new Error(jsonResp);
        }
        console.info(Order);

        if (holder == "cisco"){
            Order.manufacturer.dnts = value1
            Order.status = "1"
            let orderJSONasBytes = Buffer.from(JSON.stringify(Order));
            try {
                await stub.putState(Orderid, orderJSONasBytes); 
                console.info("(success)");
            } catch(err){
                throw new Error("@@@@@@@@@@@@@@@@@@@  Failed to update the value1 dnts (Date of notification to Shipper) && value2 dcbs  (date of Confirmation by logistic to manufacturer)  @@@@@@@@@@@@@@@@@@@")
            }
        } else if (holder == "partner"){
            Order.shipper.dcbs = value1
            Order.shipper.dntl = value2
            Order.status = "3"
            let orderJSONasBytes = Buffer.from(JSON.stringify(Order));
            try {
                await stub.putState(Orderid, orderJSONasBytes); 
                console.info("(success)");
            } catch(err){
                throw new Error("@@@@@@@@@@@@@@@@@@@  Failed to update the value1 dcbs  (date of Confirmation by logistic to manufacturer) && value2 dntl (date of notification to logistic) @@@@@@@@@@@@@@@@@@@")
            }
        }  else if (holder == "carrier"){
            
            Order.logistic.dcbl = value1
            Order.logistic.ddtc = value2
            Order.recDate = value3
            Order.status = "6"
            let orderJSONasBytes = Buffer.from(JSON.stringify(Order));
            try {
                await stub.putState(Orderid, orderJSONasBytes); 
                console.info("(success)");
            } catch(err){
                throw new Error("@@@@@@@@@@@@@@@@@@@  Failed to update the value1 dcbl (date of Confirmation by logistic to Shipper) &&  value2 ddtm (date of dispatch to client) && value ddtm (date of recieve of product back by client) @@@@@@@@@@@@@@@@@@@")
        }
    }

    console.info(" Successfully Updated in Ledger");
 }

  async queryAllOrder(stub, args, thisClass) {

    let startKey = "1";
    let endKey = "10000";

    let resultsIterator = await stub.getStateByRange(startKey, endKey);
    let method = thisClass['getAllResults'];
    let results = await method(resultsIterator, false);

    return Buffer.from(JSON.stringify(results));
  }

   async getAllResults(iterator, isHistory) {
    let allResults = [];
    while (true) {
      let res = await iterator.next();

      if (res.value && res.value.value.toString()) {
        let jsonRes = {};
        console.log(res.value.value.toString('utf8'));

        if (isHistory && isHistory === true) {
          jsonRes.TxId = res.value.tx_id;
          jsonRes.Timestamp = res.value.timestamp;
          jsonRes.IsDelete = res.value.is_delete.toString();
          try {
            jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Value = res.value.value.toString('utf8');
          }
        } else {
          jsonRes.Key = res.value.key;
          try {
            jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
          } catch (err) {
            console.log(err);
            jsonRes.Record = res.value.value.toString('utf8');
          }
        }
        allResults.push(jsonRes);
      }
      if (res.done) {
        console.log('end of data');
        await iterator.close();
        console.info(allResults);
        return allResults;
      }
    }
  }


}

shim.start(new TrackChaincode());