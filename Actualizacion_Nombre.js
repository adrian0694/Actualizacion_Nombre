CustomerInfo = {
    firstName: "",
    lastName: "",
    secondLastName: ""
}
getDataOPA = {}



OraclePolicyAutomation.AddExtension({
    customNavigationBar: function(interview) {

        async function excecuteFetch(interview, tipoRequest) {
            var options
            debugger

            switch (tipoRequest) {
                case "updateContact":
                    var request = {
                        "FirstName": CustomerInfo.firstName.indexOf(" ") == -1 ? CustomerInfo.firstName : CustomerInfo.firstName.substring(0, CustomerInfo.firstName.indexOf(" ")),
                        "LastName": CustomerInfo.lastName,
                        "SecondLastName": CustomerInfo.secondLastName,
                        "PersonDEO_CorreoSEC360_c": getDataOPA.EMAIL
                    }
                    options = {
                        connectionName: "ConsultAPIEC",
                        relativeUri: "/contacts/" + getDataOPA.PartyNumber,
                        contentType: "application/json",
                        body: JSON.stringify(request),
                        method: "PATCH"
                    }
                    break;
                case "findContact":
                    options = {
                        relativeUri: '/1.0/' + getDataOPA.COUNTRY + '/' + getDataOPA.CIF + '?Channel=EBAC',
                        connectionName: "ExcecuteQuery",
                        method: "GET"
                    }
                    break;
                case "findCOM":
                    var request = {
                        "CIF": getDataOPA.CIF,
                        'Country': getDataOPA.COUNTRY
                    }
                    options = {
                        connectionName: "ConsultCOM",
                        contentType: "application/json",
                        body: JSON.stringify(request),
                        method: "POST"
                    }
                    break;
            }
            try {
                var response = await interview.fetch(options);
                if (response.ok) {
                    debugger
                    var datos = response.json();
                    return datos;
                }
            } catch (err) {
                console.log('error' + err.message);
                return null;
            }
        }
        return {
            mount: async function(el) {
                getDataOPA = interview.getExtensionData();
                debugger
                var BCO = (getDataOPA.TYPE == "BCO") ? 'findContact' : 'findCOM'
                var infoContact = await excecuteFetch(interview, BCO);
                if (getDataOPA.TYPE == "BCO") {
                    CustomerInfo.firstName = infoContact.personalInformation.customer.firstName
                    CustomerInfo.lastName = infoContact.personalInformation.customer.lastName
                    CustomerInfo.secondLastName = infoContact.personalInformation.customer.secondLastName
                } else {
                    CustomerInfo.firstName = infoContact.message.body.cifData.firstName
                    CustomerInfo.lastName = infoContact.message.body.cifData.lastName1
                    CustomerInfo.secondLastName = infoContact.message.body.cifData.lastName2
                }
                await excecuteFetch(interview, 'updateContact');
            }
        }
    }
})
