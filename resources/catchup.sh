#!/bin/bash

CWD=$(pwd)
LABS_PATH=${CWD}/resources/labs
REPOSITORY_FILE="${CWD}/repository/repository.js"
CART_ORDER="${CWD}/resources/cart_order.json"
DEFAULT_ORDER="${CWD}/resources/default_order.json"
HOST=127.0.0.1
PORT=3000

declare -A userInfo

while getopts h:f: OPTION; do
    case $OPTION in
        h)
            HOST=$OPTARG
            ;;
        f)
            PORT=$OPTARG
            ;;
        \?)
            echo "Invalid option: -$OPTARG" >&2
            ;;
    esac
done

labs=("Lab 1 : Registration and K/V get"
"Lab 2 : FTS operations - search for products"
"Lab 3 : K/V operations - get, save, update, and delete orders"
"Lab 4 : N1QL operations - get pending order, get customer orders"
"Lab 5 : K/V sub-document operations"
"Final : All labs completed")

lab=0

getLab(){
    echo
    PS3="Please select the lab you want to jump to: "

    select choice in "${labs[@]}"
    do
    case $REPLY in
        1 | 2 | 3 | 4 | 5 | 6)
        break
        ;;
        *)
        echo "Invalid option $REPLY.  Choose between 1 - 6."
        ;;
    esac
    done
    lab=$REPLY
}

setLabFile(){
    #FILES=$LABS_PATH/*.js
    local file_count=$(ls -l $LABS_PATH/*.js | wc -l)

    if [ $file_count -ne 7 ]
    then
        echo "Missing lab files.  Path used $LABS_PATH"
        exit 3
    fi

    local lab_file="${LABS_PATH}/repository_lab0.js"
    if [ $1 -eq 1 ]
    then
        lab_file="${LABS_PATH}/repository_lab1.js"
    elif [ $1 -eq 2 ]
    then
        lab_file="${LABS_PATH}/repository_lab2.js"
    elif [ $1 -eq 3 ]
    then
        lab_file="${LABS_PATH}/repository_lab3.js"
    elif [ $1 -eq 4 ]
    then
        lab_file="${LABS_PATH}/repository_lab4.js"
    elif [ $1 -eq 5 ]
    then
        lab_file="${LABS_PATH}/repository_lab5.js"
    else
        lab_file="${LABS_PATH}/repository_final.js"
    fi

    #replace repository.js w/ lab chosen
    cp $lab_file $REPOSITORY_FILE
    echo
    if [[ $1 -eq 6 ]]; then
        echo "Successfully updated code to the end of the labs (i.e. all code is complete)."
    else
        echo "Successfully updated code to beginning of lab$1."
    fi
    echo "Pausing for API to reset..."
    sleep 5
}

getUserInfo(){
    echo
    echo "Please provide the following user information:"
    echo
    read -p "First Name: " firstName
    read -p "Last Name: " lastName
    read -p "Email: " email
    read -p "Username: " username
    read -p "Password: " password

    userInfo["firstName"]=$firstName
    userInfo["lastName"]=$lastName
    userInfo["email"]=$email
    userInfo["username"]=$username
    userInfo["password"]=$password
}

setUserInfo(){
    userInfo["firstName"]="Test"
    userInfo["lastName"]="User"
    userInfo["email"]="test.user@email.com"
    userInfo["username"]="testUser123"
    userInfo["password"]="password123"
}

testPing(){
    url="http://$HOST:$PORT/test/ping"
    curl -X GET $url -H "accept: */*" -H "Content-Type: application/json" | jq '.'
}

doesUserNotExist(){
    payload="{\"username\":\"${userInfo[username]}\",\"password\":\"${userInfo[password]}\"}"
    url="http://$HOST:$PORT/user/login"
    resp=$(curl -sS -X POST $url -H "accept: */*" -H "Content-Type: application/json" -d "$payload")
    msg=$(jq '.message' <<< "$resp")

    if [[ $msg != *"Invalid user"* ]]; then
        token=$(jq -r '.data.userInfo.token' <<< "$resp")
        custId=$(jq '.data.customerInfo.custId' <<< "$resp")
        userInfo["token"]=$token
        userInfo["custId"]=$custId
    fi

    [[ $msg == *"Invalid user"* ]]
}

login(){
    payload="{\"username\":\"${userInfo[username]}\",\"password\":\"${userInfo[password]}\"}"
    url="http://$HOST:$PORT/user/login"
    resp=$(curl -sS -X POST $url -H "accept: */*" -H "Content-Type: application/json" -d "$payload")
    msg=$(jq '.message' <<< "$resp")

    if [[ $msg == *"Successfully logged in"* ]]; then
        token=$(jq -r '.data.userInfo.token' <<< "$resp")
        custId=$(jq '.data.customerInfo.custId' <<< "$resp")
        userInfo["token"]=$token
        userInfo["custId"]=$custId
    fi
}

registerUser(){
    firstName="\"firstName\":\"${userInfo[firstName]}\""
    lastName="\"lastName\":\"${userInfo[lastName]}\""
    username="\"username\":\"${userInfo[username]}\""
    email="\"email\":\"${userInfo[email]}\""
    password="\"password\":\"${userInfo[password]}\""
    payload="{$firstName,$lastName,$email,$username,$password}"

    url="http://$HOST:$PORT/user/register"
    resp=$(curl -sS -X POST $url -H "accept: */*" -H "Content-Type: application/json" -d "$payload")
    msg=$(jq '.message' <<< "$resp")

    if [[ $msg == *"Successfully registered customer"* ]]; then
        echo
        echo "User successfully registered."
        sleep 1
        login
    fi
}

createOrders(){
    name="${userInfo[lastName]} ${userInfo[firstName]}"
    #use --argjson for custId to keep it as INT
    json=$(cat $DEFAULT_ORDER | jq --argjson custId ${userInfo[custId]} --arg name "$name" '((.custId,.doc.createdBy,.doc.modifiedBy)=$custId | (.billingInfo.name,.shippingInfo.name)=$name)')
    payload="{\"order\":$json,\"update\":false}"
    url="http://$HOST:$PORT/user/saveOrUpdateOrder"
    auth="Authorization: Bearer ${userInfo[token]}"
    resp=$(curl -sS -X POST $url -H "accept: */*" -H "Content-Type: application/json" -H "$auth" -d "$payload")
    msg=$(jq '.message' <<< "$resp")

    if [[ $msg == *"Successfully saved"* ]]; then
        echo
        echo "Processed order successfully created."
    fi

    sleep 1

    json=$(cat $CART_ORDER | jq --argjson custId ${userInfo[custId]} '(.custId,.doc.createdBy)=$custId')
    payload="{\"order\":$json,\"update\":false}"
    url="http://$HOST:$PORT/user/saveOrUpdateOrder"
    auth="Authorization: Bearer ${userInfo[token]}"
    resp=$(curl -sS -X POST $url -H "accept: */*" -H "Content-Type: application/json" -H "$auth" -d "$payload")
    msg=$(jq '.message' <<< "$resp")

    if [[ $msg == *"Successfully saved"* ]]; then
        echo
        echo "Pending cart order successfully created."
    fi
}

getLab
getUserInfo
setLabFile $lab

if doesUserNotExist; then
    echo
    echo "User does not exist.  Registering user..."
    registerUser
fi

if [ $lab -ge 4 ]; then
    echo
    echo "Creating orders..."
    sleep 1
    createOrders
fi

echo
if [[ $1 -eq 6 ]]; then
    echo "Catchup complete.  All web UI functionality should exist now."
else
    echo "Catchup complete.  Please see Lab$lab for instructions."
fi

if [[ -z ${userInfo[token]} ]]; then
    echo "Unable to verify user.  Please use web UI to create/verify user."
fi

echo "User credentials: "
echo "Username: ${userInfo[username]}"
echo "Password: ${userInfo[password]}"
echo