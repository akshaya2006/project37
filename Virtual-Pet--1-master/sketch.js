//Create variables here
var dog,hungryDog,happyDog, database;
var foodS,foodStock;
var fedTime,lastFed;
var feed,addFood;
var foodObj,currentTime;
var milk, input, name;
var gameState = "hungry";
var gameStateRef;
var bedroomImg, gardenImg, washroomImg, sleepImage, runImg;
var garden, washroom, bedroom;
var input, button;
var frameCountNow = 0;

//load images here
function preload(){

hungryDog=loadImage("images/Dog.png");
happyDog=loadImage("images/happy dog.png");
bedroomImg = loadImage("images/Bed Room.png");
gardenImg = loadImage("images/Garden.png");
washroomImg = loadImage("images/Wash Room.png");
sleepImage = loadImage("images/Lazy.png");
runImg = loadImage("images/runningLeft.png");

}

function setup() {
  createCanvas(1200,500);
  database=firebase.database();
  
  foodObj = new Food();

  foodStock=database.ref('Food');
  foodStock.on("value",readStock);
  
  dog=createSprite(width/2+250,height/2,10,10);
  dog.addAnimation("hungry",hungryDog);
  dog.addAnimation("happy",happyDog);
  dog.addAnimation("sleeping",sleepImage);
  dog.addAnimation("run",runImg);
  dog.scale=0.3;

  getGameState();
  
  feed=createButton("Feed the dog");
  feed.position(950,95);
  feed.mousePressed(feedDog);

  addFood=createButton("Add Food");
  addFood.position(1050,95);
  addFood.mousePressed(addFoods);

  input = createInput("Pet name");
  input.position(920,120);

  button = createButton("Confirm");
  button.position(1000,145);
  button.mousePressed(createName);

}

function draw() {
   currentTime = hour();
   if (currentTime === lastFed + 1){
     gameState = "playing";
     updateGameState();
     foodObj.garden();
    
   }
   else if (currentTime === lastFed + 2){
     gameState = "sleeping";
     updateGameState();
     foodObj.bedroom();
   }
   else if (currentTime > lastFed +2 && currentTime <= lastFed + 4){
     gameState = "bathing";
     updateGameState();
     foodObj.washroom();
   }
   else {
     updateGameState("hungry");
     foodObj.display();
   }

   foodObj.getFoodStock();
   getGameState();
   
   fedTime = database.ref('fedTime');
   fedTime.on("value",function(data){
     lastFed = data.val();
   })
   
   if (gameState !== "hungry"){
     feed.hide();
     addFood.hide();
     dog.remove();
   }
   else {
     feed.show();
     addFood.show();
     dog.addImage(sleepImage)
   }

   drawSprites();

   textSize(32);
   fill("red");
   textSize(20);
   text("Last fed: "+lastFed+":00",300,95);
   text("Time since last fed: "+(currentTime - lastFed),300,125);

  }
  
  function feedDog(){
   foodObj.duductFood();
   foodObj.updateFoodStock();
   dog.changeAnimation("happy", happyDog);
   gameState = "happy";
   updateGameState();
}

  function addFoods(){
    foodObj.addFood();
    foodObj.updateFoodStock();
}

async function hour(){
  var site = await fetch("http://worldtimeapi.org/api/timezone/Asia/Kolkata");
  var siteJSON = await site.json();
  var database = siteJSON.datatime;
  var hourTime = dataTime.slice(11,13);
  return hourTime;
}
 
  function createName(){
    input.hide();
    button.hide();

    name = input.value();
    var greeting = createElement('h3');
    greeting.html("Pet's name: "+name);
    greeting.position(width/2+150,height/2+60);
  }  
   
   function getGameState(){
     gameStateRef = database.ref('gameState');
     gameStateRef.on("value",function(data){
       gameState = data.val();
     });
   };
   function updateGameState(){
     database.ref('/').update({
      gameState: gameState
     })
   }
   function readStock(data){
    updateGameState=data.val();
    foodObj.updateFoodStock(updateGameState);
  }
