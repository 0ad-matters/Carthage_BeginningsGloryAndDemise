warn("loading the triggers file");

///////////////////////
// Trigger listeners //
///////////////////////


var unitTargetClass = "Unit+!Ship";
var siegeTargetClass = "Structure";

var triggerPointsSpawnTrireme = "A";
/*var triggerPointsArrival = "B";
var triggerPointsArcherAmbush = "C";
var triggerPointsTemple = "D";
var triggerPointsMercs = "E";
var triggerPointsElephantTraders = "F";
var triggerPointsCaveRaiders = "G";
var triggerPointsCaveRaidersTargets = "H";
var triggerPointsCaveFortress = "I";*/



//var triggerPointsAdvanceAttack = "A";
//var triggerPointsMainAttack = "B";
//var triggerPointsMace = "C";
//var triggerPointsColonyAmbush = "G";
//var triggerPointsTemple = "H";
//var triggerPointsCavalryAttack = "A";
/*var triggerPointAmbush = "B";
var triggerPointTradeOutpost = "K";
var triggerPointStables = "C";
var triggerPointTraders = "D";
var triggerPointTraderAmbush = "E";
var triggerPointMountainAttack = "F";
var triggerPointMountainAttackSpawn = "G";
var triggerPointTempleQuest = "H";
var triggerPointKidnapperGuardPatrol = "J";
var triggerPointStartAssault = "I";*/



var unitFormations = [
	"special/formations/box",
	"special/formations/battle_line",
	"special/formations/line_closed",
	"special/formations/column_closed"
];


var disabledTemplatesCCs = (civ) => [

	
	// Expansions
	"structures/" + civ + "_civil_centre",
	"structures/" + civ + "_military_colony",

	// Shoreline
	"structures/brit_crannog"
];

var disabledTemplatesDocksCCs = (civ) => [

	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse"
];


var disabledTemplates = (civ) => [
	// Economic structures
	"structures/" + civ + "/corral",
	"structures/" + civ + "/farmstead",
	//"structures/" + civ + "/field",
	"structures/" + civ + "/storehouse",
	"structures/" + civ + "/rotarymill",
	"structures/" + civ + "/market",
	"structures/" + civ + "/house",
	
	// Expansions
	"structures/" + civ + "/civil_centre",
	"structures/" + civ + "/military_colony",

	// Walls
	"structures/" + civ + "/wallset_stone",
	"structures/rome_wallset_siege",
	"other/wallset_palisade",

	// Shoreline
	"structures/" + civ + "/dock",
	"structures/brit/crannog",
	"structures/cart/super_dock",
	"structures/ptol/lighthouse",
	
	//villagers
	"units/" + civ + "/support_female_citizen"
];



Trigger.prototype.WalkAndFightRandomtTarget = function(attacker,target_player,target_class)
{
	let target = this.FindRandomTarget(attacker,target_player,target_class);
	if (!target)
	{
		target = this.FindRandomTarget(attacker,target_player,siegeTargetClass);
	}
	
	
	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
		
		
		let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
	}
	else //find a structure
	{
		
		
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}
	
}

Trigger.prototype.WalkAndFightClosestTarget = function(attacker,target_player,target_class)
{
	let target = this.FindClosestTarget(attacker,target_player,target_class);
	if (!target)
	{
		target = this.FindClosestTarget(attacker,target_player,siegeTargetClass);
	}
	
	
	if (target)
	{
		// get target position
		var cmpTargetPosition = Engine.QueryInterface(target, IID_Position).GetPosition2D();
		
		
		let cmpUnitAI = Engine.QueryInterface(attacker, IID_UnitAI);
		cmpUnitAI.SwitchToStance("violent");
		cmpUnitAI.WalkAndFight(cmpTargetPosition.x,cmpTargetPosition.y,null);
	}
	else //find a structure
	{
		
		
		warn("[ERROR] Could not find closest target to fight: "+attacker+" and "+target_player+" and "+target_class);
	}
	
}


Trigger.prototype.FindRandomTarget = function(attacker,target_player,target_class)
{
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
	if (targets.length < 1)
	{
		//no targets, check if any unit is there
		targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);
	
	}
	
	//if still no targets return null
	if (targets.length < 1)
	{
		warn("[ERROR] Could not find target!");
		return null;
	}
	
	return pickRandom(targets);
}


Trigger.prototype.FindClosestTarget = function(attacker,target_player,target_class)
{
	
	//let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player), unitTargetClass);
	
	let targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), target_class).filter(TriggerHelper.IsInWorld);
	
	if (targets.length < 1)
	{
		//no targets, check if any unit is there
		targets = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(target_player), "Unit").filter(TriggerHelper.IsInWorld);
	
	}
	
	//if still no targets return null
	if (targets.length < 1)
	{
		warn("[ERROR] Could not find target!");
		return null;
	}
	
	let closestTarget;
	let minDistance = Infinity;
	
	for (let target of targets)
	{
		if (!TriggerHelper.IsInWorld(target))
			continue;

		let targetDistance = PositionHelper.DistanceBetweenEntities(attacker, target);
		if (targetDistance < minDistance)
		{
			closestTarget = target;
			minDistance = targetDistance;
		}
	}
	
	return closestTarget;
}

Trigger.prototype.SpawnAttackSquad = function(data)
{
	
	let p = data.p;
	let site = data.site;
	let templates = data.templates;
	let size = data.size; 
	let target_class = data.target_class;
	let target_player = data.target_player;
	let target_pos = data.target_pos;
	let use_formation = data.use_formation;
	
	
	//spawn the units
	let attackers = [];	
	for (let i = 0; i < size; i++)
	{
		let unit_i = TriggerHelper.SpawnUnits(site,pickRandom(templates),1,p);
		attackers.push(unit_i[0]);
	}
	
	//set formation
	if (use_formation == undefined || use_formation == true)
	{
		TriggerHelper.SetUnitFormation(p, attackers, pickRandom(unitFormations));
	}

	//make them attack
	let target = this.FindClosestTarget(attackers[0],target_player,target_class);
	
	//if (target_pos == undefined)
	
	target_pos = TriggerHelper.GetEntityPosition2D(target);
	
	ProcessCommand(p, {
		"type": "attack-walk",
		"entities": attackers,
		"x": target_pos.x,
		"z": target_pos.y,
		"queued": true,
		"targetClasses": {
			"attack": unitTargetClass
		},
		"allowCapture": false
	});
}


//scenario indendent functions
Trigger.prototype.PatrolOrderList = function(units,p,patrolTargets)
{
	
	if (units.length <= 0)
		return;
		

	for (let patrolTarget of patrolTargets)
	{
		let targetPos = TriggerHelper.GetEntityPosition2D(patrolTarget);
		ProcessCommand(p, {
			"type": "patrol",
			"entities": units,
			"x": targetPos.x,
			"z": targetPos.y,
			"targetClasses": {
				"attack": unitTargetClass
			},
			"queued": true,
			"allowCapture": false
		});
	}
}


Trigger.prototype.ShowText = function(text,option_a,option_b)
{
	var cmpGUIInterface = Engine.QueryInterface(SYSTEM_ENTITY, IID_GuiInterface);
	cmpGUIInterface.PushNotification({
		"type": "dialog",
		"players": [1,2,3,4,5,6,7,8],
		"dialogName": "yes-no",
		"data": {
			"text": {
				"caption": {
					"message": markForTranslation(text),
					"translateMessage": true,
				},
			},
			"button1": {
				"caption": {
					"message": markForTranslation(option_a),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation(option_a),
					"translateMessage": true,
				},
			},
			"button2": {
				"caption": {
					"message": markForTranslation(option_b),
					"translateMessage": true,
				},
				"tooltip": {
					"message": markForTranslation(option_b),
					"translateMessage": true,
				},
			},
		},
	});
	
}

Trigger.prototype.StructureDecayCheck = function(data)
{
	for (let p of [1,3,4,5])
	{
		let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);

		for (let s of structs)
		{
			var cmpCapt = Engine.QueryInterface(s, IID_Capturable);
			if (cmpCapt)
			{
				let c_points = cmpCapt.GetCapturePoints();
				
				
				if (c_points[0] > 0)
				{
					c_points[p] += c_points[0];
					c_points[0] = 0;
					cmpCapt.SetCapturePoints(c_points);

				}
				
			}
		}
	}
	
	
}



Trigger.prototype.MonitorCrazedHeroesQuest = function(data)
{
	if (this.crazedHeroesInProgress == true)
	{
		let p = 6;
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Hero").filter(TriggerHelper.IsInWorld);
		
		let nomad_temple = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(8),"Temple").filter(TriggerHelper.IsInWorld)[0];
				
		//make them attack
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle())
				{
					this.WalkAndFightClosestTarget(u,1,"Hero");
				}
			}
			
			//check if any of them are close to the gaia temple
			let d = DistanceBetweenEntities(u, nomad_temple);

			if (d < 35)
			{
				this.QuestCrazedHeroesComplete();
				return;
			}
		}
		
		this.DoAfterDelay(5 * 1000,"MonitorCrazedHeroesQuest",null);	
	}
}


Trigger.prototype.MonitorRiverBanditsQuestQuest = function(data)
{
	
}

Trigger.prototype.MonitorBarracksCaptivesQuest = function(data)
{
	//for barracks captives quest
	if (this.barracksCaptivesQuestStarted == true && this.barracksCaptivesQuestDone == false)
	{
		let p = 6;
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Soldier").filter(TriggerHelper.IsInWorld);
		
		if (units.length == 0)
		{
			//quest is done, give reward
			this.QuestBarracksCaptivesComplete();
		}
		else 
		{
			//make them attack
			for (let u of units)
			{
				let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
				if (cmpUnitAI)
				{
					if (cmpUnitAI.IsIdle())
					{
							this.WalkAndFightClosestTarget(u,1,"Hero");
					}
				}
			}	
			
			
			this.DoAfterDelay(5 * 1000,"MonitorBarracksCaptivesQuest",null);
		}
	}
	
}




Trigger.prototype.IdleUnitCheck = function(data)
{
	for (let p of [4])
	{
		//find all idle units
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		let idle_units = [];
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					idle_units.push(u);
				}
			}
		}
		
		//make idle units patrol if buildings are available
		let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Structure").filter(TriggerHelper.IsInWorld);
		
		if (patrol_sites.length > 3)
		{
			for (let u of idle_units)
			{
				//pick patrol sites
				let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
						
				this.PatrolOrderList([u],p,sites);
			}
		}
	}
	
	for (let p of [3])
	{
		//find all idle units
		let units = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Unit").filter(TriggerHelper.IsInWorld);
		
		let idle_units = [];
		for (let u of units)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				if (cmpUnitAI.IsIdle()){
					this.WalkAndFightClosestTarget(u,1,"Structure");
				}
			}
		}
	}
}


//garison AI entities with archers
Trigger.prototype.GarrisonEntities = function(data)
{
	//garrrison ships
	for (let p of [1])
	{
		//find triremes
		let triremes = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Warship").filter(TriggerHelper.IsInWorld);
		let trade_ships = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Ship+Trader").filter(TriggerHelper.IsInWorld);
	
		for (let ship of triremes)
		{
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/ptol/hero_cleopatra_vii",1,p);
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/maur/champion_maiden_archer",5,p);
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/cart/champion_cavalry",5,p);
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/cart/champion_infantry",5,p);
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/cart/infantry_swordsman_gaul_e",10,p);
		}
		
		for (let ship of trade_ships)
		{
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/cart/support_female_citizen",5,p);
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/cart/infantry_spearman_b",5,p);
			TriggerHelper.SpawnGarrisonedUnits(ship, "units/cart/infantry_archer_b",5,p);
		}
	}
	
	//gaia
	for (let p of [0])
	{
		let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
		
		for (let c of towers)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/gau/infantry_slinger_e",5,p);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
	
	//fortress
	for (let p of [2])
	{
		let troop_owner = 3;
		
		//5 person towers
		let towers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"StoneTower").filter(TriggerHelper.IsInWorld);
	
		
		for (let c of towers)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e",5,troop_owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		let stowers = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"SentryTower").filter(TriggerHelper.IsInWorld);
	
		for (let c of stowers)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e",3,troop_owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
		
		
		let forts = TriggerHelper.MatchEntitiesByClass( TriggerHelper.GetEntitiesByPlayer(p),"Fortress").filter(TriggerHelper.IsInWorld);
		
		for (let c of forts)
		{
			//spawn the garrison inside the tower
			let archers_e = TriggerHelper.SpawnUnits(c, "units/pers/infantry_archer_e",20,troop_owner);
			
			for (let a of archers_e)
			{
				let cmpUnitAI = Engine.QueryInterface(a, IID_UnitAI);
				cmpUnitAI.Garrison(c,true);
			}
		}
	}
}	


 
Trigger.prototype.VictoryCheck = function(data)
{

	//check to see that player 2 has no units
	let ccs_2 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"CivilCentre").filter(TriggerHelper.IsInWorld);
	let ccs_3 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3),"CivilCentre").filter(TriggerHelper.IsInWorld);
	let ccs_5 = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(5),"CivilCentre").filter(TriggerHelper.IsInWorld);
	
	//warn(ccs_2.length +" "+ccs_3.length + " " + ccs_5.length);
	
	if (ccs_2.length <= 0 && ccs_3.length <= 0 && ccs_5.length <= 0)
	{
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	else
	{
		this.DoAfterDelay(15 * 1000,"VictoryCheck",null);
	}
}


Trigger.prototype.OwnershipChangedAction = function(data)
{
	if (data.entity == this.enemy_hero_location && this.heroSpawned == false)
	{
		//spawn hero
		let enemy_hero= TriggerHelper.SpawnUnits(data.entity,"units/cart/hero_maharbal",1,2);
		let enemy_hero_support= TriggerHelper.SpawnUnits(data.entity,"units/cart/champion_infantry",10,2);
		
		this.ShowText("We have found him! Time for revenge!","Yeah!","Let's do it");
		
		this.heroSpawned = true;
		this.enemy_hero_id = enemy_hero[0];
	}
	
	
	if (data.entity == this.enemy_hero_id)
	{
		//TO DO: win game
		TriggerHelper.SetPlayerWon(1,this.VictoryTextFn,this.VictoryTextFn);	
	}
	
	
	//check if pegasus
	/*if (data.entity == 6197)
	{
		this.ShowText("Great job! With the rescued treasure, your husband was able to procure a ship awaiting to load your elephants. On to the Celtic settlement!","Yes!","Sure thing");
		
		this.DoAfterDelay(1 * 1000,"QuestPegasusComplete",null);
	}
	
	//check if crannog
	if (data.entity == 6085 && data.to == 1)
	{
		//schedule going to war with the assyrians
		this.DoAfterDelay(120 * 1000,"EventWarAssyria",null);
		
		//text
		this.ShowText("Great! Once we havve pacified the entire village, let's get to work. We need to mine as much metal as possible so we can construct more ships. We should also trade with anyone willing to do so.","I'm on it", "Sure thing");
		
	}*/
		

}


Trigger.prototype.EventWarAssyria = function(data)
{
	this.ShowText("We have just received some alarming news: the local Assyrian governor has heard of your exploits and has decided that he willl have none of it! We are now officially at war with his settlement to the south. We should defeat them as quickly as possible before reinforcements arrive","Oh my!","No way!");

	for (let p of [3,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		cmpPlayer.SetPopulationBonuses(300);
		cmpPlayer.SetMaxPopulation(300);
		
		//cmpPlayer.AddResource("food",2000);
		//cmpPlayer.AddResource("wood",2000);
		//cmpPlayer.AddResource("metal",2000);
		//cmpPlayer.AddResource("stone",2000);
		
		let ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p), "CivilCentre").filter(TriggerHelper.IsInWorld);
		
		
		
		//change diplomacy
		cmpPlayer.SetEnemy(1);
		
		let cmpPlayer_1 = QueryPlayerIDInterface(1);
		cmpPlayer_1.SetEnemy(p);

		if (ccs.length > 0)
		{
			let site = ccs[0];
			let units1= TriggerHelper.SpawnUnits(site,"units/pers_infantry_archer_b",10,p);
			let units2= TriggerHelper.SpawnUnits(site,"units/pers_infantry_spearman_b",10,p);
		}
	}
	
}

Trigger.prototype.ResearchTechs = function(data)
{

	
	for (let p of [2])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
		
		cmpTechnologyManager.ResearchTechnology("tower_range");
		cmpTechnologyManager.ResearchTechnology("tower_watch");
		cmpTechnologyManager.ResearchTechnology("tower_murderholes");
		cmpTechnologyManager.ResearchTechnology("tower_crenellations");
	}
	
}

Trigger.prototype.VictoryTextFnEnemy = function(n)
{
	return markForPluralTranslation(
          "You have lost too many troops! %(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}

Trigger.prototype.VictoryTextFn = function(n)
{
	return markForPluralTranslation(
          "%(lastPlayer)s has won (game mode).",
         "%(players)s and %(lastPlayer)s have won (game mode).",
          n);
}


Trigger.prototype.AssyrianAttack = function(data)
{
	let owner = 4;
	let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner),"Unit").filter(TriggerHelper.IsInWorld);
	
	let rand_threshold = pickRandom([0.2,0.2,0.3,0.5]);
		
	//attack
	for (let u of soldiers)
	{
		if (Math.random() < rand_threshold)
		{
			let cmpUnitAI = Engine.QueryInterface(u, IID_UnitAI);
			if (cmpUnitAI)
			{
				this.WalkAndFightRandomtTarget(u,1,"Structure");
			}
		}
	}
	
}

Trigger.prototype.IntervalAttackCheck = function(data)
{
	//check if player 1 has structures
	let structs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1),"Structure").filter(TriggerHelper.IsInWorld);
	
	warn("interval check for attacks, probs = "+this.watchAttackProbBaseCurrent+"\t"+this.elitesAttackProbBaseCurrent);
	
	if (Math.random() < this.watchAttackProbBaseCurrent && structs.length > 0) //attack happens
	{
		let owner = 4;
		
		this.DoAfterDelay(10 * 1000,"AssyrianAttack",null);
		warn("attack");
		
		//spawn some siege
		let forts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"Arsenal").filter(TriggerHelper.IsInWorld);
		
		if (forts.length > 0)
		{
			let siege_size = pickRandom([2,3,3,5,7]);
			for (let i = 0; i < siege_size; i ++)
			{
				let unit_i = TriggerHelper.SpawnUnits(pickRandom(forts),"units/pers/siege_ram",1,owner);
				let cmpUnitAI = Engine.QueryInterface(unit_i[0], IID_UnitAI);
				if (cmpUnitAI)
				{
					this.WalkAndFightRandomtTarget(unit_i[0],1,"Structure");
				}	
			}
		}
		
		//set probability to default level
		this.watchAttackProbBaseCurrent = this.watchAttackProbBase;
	}
	else {
		//increment probability for next time
		this.watchAttackProbBaseCurrent += this.probIncrement;
	}
	
	//also possible to have some squads
	if (Math.random() < this.elitesAttackProbBaseCurrent)
	{
		this.DoAfterDelay(5 * 1000,"SpawnCavalryAttack",null);
		
		this.elitesAttackProbBaseCurrent = this.elitesAttackProbBase;
	}
	else {
		
		this.elitesAttackProbBaseCurrent += this.probIncrement;
	}
	
	//schedule again
	this.DoAfterDelay(60 * 1000,"IntervalAttackCheck",null);
	
}

Trigger.prototype.IntervalSpawnAssyrianGuards = function(data)
{
	for (let p of [2])
	{
		let owner = 4;
		let soldiers = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(owner),"Unit").filter(TriggerHelper.IsInWorld);
		//warn("found "+ soldiers.length + " soldiers");
		
		//check for docks and arsenal
		let docks = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Dock").filter(TriggerHelper.IsInWorld);
		let arsenals = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Arsenal").filter(TriggerHelper.IsInWorld);
		
		let pop_cap = 275;
		
		if (docks.length > 0)
			pop_cap += 100;
			
		if (arsenals.length > 0)
			pop_cap += 75;
		//warn("pop cap = "+pop_cap);
		if (soldiers.length < pop_cap)
		{
		
			let size = 1;
			
			
			let cmpPlayer_v = QueryPlayerIDInterface(owner);
			if (cmpPlayer_v.GetState() != "active")
				return; //we are dead
		
			//check if player 2 has structures
			let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
			
			if (patrol_sites.length < 4)
				return;
				
		
			for (let i = 0; i < size; i ++)
			{
				
				let inf_templates = ["units/pers/champion_infantry","units/pers/arstibara","units/pers/infantry_javelineer_e","units/pers/infantry_archer_e","units/pers/infantry_spearman_e"];
			
				//pick patrol sites
				let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
							
				//spawn the unit
				let unit_i = TriggerHelper.SpawnUnits(sites[0],pickRandom(inf_templates),1,owner);
								
				this.PatrolOrderList(unit_i,owner,sites);
				
			}
		}
		
		//schedule
		let interval_seconds = 1+Math.round(0.5*Math.sqrt(soldiers.length));
		//warn("next spawn in "+interval_seconds);
		this.DoAfterDelay(interval_seconds * 1000,"IntervalSpawnAssyrianGuards",null);
	}
	
	
	
}


Trigger.prototype.StatusCheck = function(data)
{
	this.statusCheckCounter ++;
	warn("status check counter = "+this.statusCheckCounter);
	
	if (this.statusCheckCounter == 18)
	{
		this.watchAttackProbBase = 0.075;
		this.elitesAttackProbBase = 0.1;
		
		this.watchAttackProbBaseCurrent = this.watchAttackProbBase;
		this.elitesAttackProbBaseCurrent = this.elitesAttackProbBase;
		this.probIncrement = 0.0175;
		
		
		this.DoAfterDelay(30 * 1000,"IntervalAttackCheck",null);
	}
	
	
	this.DoAfterDelay(30 * 1000,"StatusCheck",null);
}


Trigger.prototype.CheckForCC = function(data)
{
	//check if player 1 has built structure
	let structures = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Structure").filter(TriggerHelper.IsInWorld);
	
	//warn("Found "+structures.length+" structures");
	
	if (structures.length >= 3) //start after at least 5 structures
	{
		warn("starting status check");
		
		this.statusCheckCounter = 0;
		this.DoAfterDelay(30 * 1000,"StatusCheck",null);
		
	}
	else 
	{
		this.DoAfterDelay(15 * 1000,"CheckForCC",null);
	}
}


Trigger.prototype.QuestPegasusComplete = function(data)
{
	let data_spawn = {};
	
	data_spawn.site = this.GetTriggerPoints(triggerPointsSpawnTrireme)[0];
	data_spawn.template = "units/cart_ship_trireme"
	data_spawn.owner = 1;
	data_spawn.size = 1;
	
	this.SpawnUnit(data_spawn);
			
}



	

Trigger.prototype.SpawnCavalryAttack = function(data)
{
	let p = 3;
	
	//check if targets exist
	let target_player = 1;
	let targets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(target_player),"Structure").filter(TriggerHelper.IsInWorld);
	
	warn("cav attack");
		
	if (targets.length > 0)
	{
		warn("starting attack in reesponse to structure destroyed");
		
		let num_waves = 3;
		
		
		for (let i = 0; i < num_waves; i ++)
		{
			
			let templates = ["units/pers/champion_infantry","units/pers/champion_cavalry","units/pers/cavalry_axeman_a","units/pers/cavalry_archer_a","units/pers/kardakes_hoplite","units/pers/infantry_archer_e","units/pers/siege_ram"];
			
			let base_size = 16;
			let size_increase = 5;
			
			//decide how many
			let size = base_size + i*size_increase;
			
			let data = {};
			
			let spawn_site = this.GetTriggerPoints("A")[0];

			
			
			data.p = p;
			data.templates = templates;
			data.size = size;
			data.target_class = "Structure";
			data.target_player = 1;
			data.site = spawn_site;
			
			this.DoAfterDelay((i+1) * 20 * 1000,"SpawnAttackSquad",data);
		}
	}
}

Trigger.prototype.IntervalSpawnTraders = function(data)
{
	let e = 5;
	
	let cmpPlayer = QueryPlayerIDInterface(e);
	if (cmpPlayer.GetState() != "active")
	{
		return;
	}
	
	//find how many traders hips we have
	let traders = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+Ship").filter(TriggerHelper.IsInWorld);
	
	if (traders.length < 8)
	{
		//make list of own markets
		let markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Dock+Market").filter(TriggerHelper.IsInWorld);
		
		let markets_others = [];
		markets_others = markets_others.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2), "Dock+Market").filter(TriggerHelper.IsInWorld));
		markets_others = markets_others.concat(TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(4), "Dock+Market").filter(TriggerHelper.IsInWorld));
			
		if (markets.length > 0 && markets_others.length > 0)
		{
			let spawn_market = pickRandom(markets);
			let target_market = pickRandom(markets_others);
			
			let trader = TriggerHelper.SpawnUnits(spawn_market,"units/pers_ship_merchant",1,e);	
			let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
					
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(target_market,spawn_market,null,true);
		}
	}
	
	//next check for land traders
	let traders_land = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Trader+!Ship").filter(TriggerHelper.IsInWorld);
	if (traders_land.length < 6)
	{
		//make list of own markets
		let markets = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(e), "Market").filter(TriggerHelper.IsInWorld);
		
		//make list of trading markets
		let markets_others = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(3), "Market+!Dock").filter(TriggerHelper.IsInWorld);
		
		if (markets.length > 0 && markets_others.length > 0)
		{
			let spawn_market = pickRandom(markets);
			let target_market = pickRandom(markets_others);
				
			let trader = TriggerHelper.SpawnUnits(spawn_market,"units/pers_support_trader",1,e);	
			let cmpUnitAI = Engine.QueryInterface(trader[0], IID_UnitAI);
						
			cmpUnitAI.UpdateWorkOrders("Trade");
			cmpUnitAI.SetupTradeRoute(target_market,spawn_market,null,true);
		}
	}
	
	
	
	this.DoAfterDelay(30 * 1000,"IntervalSpawnTraders",data);
		
}


Trigger.prototype.SpawnUnit = function(data)
{
	let site = data.site; 
	let template = data.template;
	let owner = data.owner;
	let num = data.size;
	
	//warn("spawning unit: "+uneval(data));
	
	let unit_i = TriggerHelper.SpawnUnits(site,template,num,owner);
		
}


Trigger.prototype.PlayerCommandAction = function(data)
{
	
	//warn(uneval(data));
	if (data.cmd.type == "dialog-answer")
	{
		//warn("The OnPlayerCommand event happened with the following data:");
		//warn(uneval(data));
		//warn("dialog state = "+this.dialogState);
		
		if (this.dialogState == "archers")
		{
			if (data.cmd.answer == "button1")
			{
				//pay
				let cmpPlayer = QueryPlayerIDInterface(1);
				cmpPlayer.AddResource("metal",-500);
				
				//get tech
				let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
				cmpTechnologyManager.ResearchTechnology("persians/special_archery_tradition");
		
				this.archersTrained = true;
			}
			else {
				this.DoAfterDelay(30 * 1000,"ToggleArcherTraining",null);		
			}
		}
		else if (this.dialogState == "barracksCaptives")
		{
				if (data.cmd.answer == "button1")
				{
					this.barracksCaptivesQuestStarted = true;
					
					//start attack
					let site = this.GetTriggerPoints(triggerPointsBarracksCaptives)[0];
	
					let templates = ["units/pers_infantry_archer_e","units/pers_infantry_spearman_e","units/pers_champion_infantry","units/pers_kardakes_hoplite","units/pers_kardakes_skirmisher"];
		
					//warn(uneval(id.classesList));
					
					let data_attack = {};
					data_attack.p = 6;
					data_attack.site = site;
					data_attack.templates = templates;
					data_attack.size = 10;
					//data_attack.size = 1;
					data_attack.target_class = "Hero";
					data_attack.target_player = 1;
					data_attack.use_formation = false;
					
					this.DoAfterDelay(2 * 1000,"SpawnAttackSquad",data_attack);
					data_attack.size = 12;
					//data_attack.size = 2;
					this.DoAfterDelay(14 * 1000,"SpawnAttackSquad",data_attack);
					this.DoAfterDelay(16 * 1000,"MonitorBarracksCaptivesQuest",null);
				}
				else 
				{
					//do nothing
				}
				
				this.dialogState  = "none";
		}
	}
};


Trigger.prototype.SpawnAssyrianGuards = function(data)
{
	for (let p of [2])
	{
		let size = 200;
		let owner = 4;
		
		for (let i = 0; i < size; i ++)
		{
			
			//find patrol/spawn sites
			let patrol_sites = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(p),"Structure").filter(TriggerHelper.IsInWorld);
			
			let inf_templates = ["units/pers/champion_infantry","units/pers/arstibara","units/pers/infantry_javelineer_e","units/pers/infantry_archer_e","units/pers/infantry_spearman_e","units/pers/kardakes_hoplite","units/pers/kardakes_skirmisher"];
			
			//pick patrol sites
			let sites = [pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites),pickRandom(patrol_sites)];
					
			//spawn the unit
			let unit_i = TriggerHelper.SpawnUnits(pickRandom(sites),pickRandom(inf_templates),1,owner);
						
			this.PatrolOrderList(unit_i,owner,sites);
		}
	}
	
}


Trigger.prototype.LoseGame = function(data)
{
	TriggerHelper.SetPlayerWon(2,this.VictoryTextFn,this.VictoryTextFn);	
		
	
}


Trigger.prototype.FlipOutpostOwnership = function(data)
{
	let outposts = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(1), "Outpost").filter(TriggerHelper.IsInWorld);
	
	for (let u of outposts)
	{
		var cmpOwnership = Engine.QueryInterface(u, IID_Ownership);
		cmpOwnership.SetOwner(0);
	}
}

/* Quests:
 * 
 *  1. encounter with elephant ambusher's cave; need to lead elephants past walled in archers
 * 	reward: rescue 1 or 2 heros DONE
 * 
 *  2. encountaer with barracks that holds captives, gets assaulted then gets 2 heros DONE, heros lose about 550 hp total, mostly for melee units
 * 
 *  3. up in the mountain you discover 2 heros, however, they have gone sick from eating wild mushrooms and attack, need to lead them to a temple and then they regain their condition DONE
 * 
 *  - the closest village is willing to provide information about one of your companions, in exchange need to destroy a bandit base; turns out they have found him and were healing him DONE
 * 	get about 4400 loot, mostly food wood metal with some stone, lost very few hit points with clever strategy, took about 9 minutes to destroy main camp
 * 
 *  -  capture catapults from gaia DONE
 * 
 *  - destroy gate over river passage DONE get about 3500 food and 3500 wood and 4000 metal, a bit of stone
 * 
 *  - when reaching the greek colony, takes over and prepares for an assault
 * 
 * AIs:
 * 
 * 	- initial traders (2 ships per village), DONE, make about 850 per 5 minutes (170 per min)
 * 




 */ 
 
 


{
	
	
	let cmpTrigger = Engine.QueryInterface(SYSTEM_ENTITY, IID_Trigger);

	
	//some state variables
	cmpTrigger.heroSpawned = false;
	cmpTrigger.enemy_hero_id = null;
	
	//get list of ccs by player 2
	let ccs = TriggerHelper.MatchEntitiesByClass(TriggerHelper.GetEntitiesByPlayer(2),"CivilCentre").filter(TriggerHelper.IsInWorld);
	cmpTrigger.enemy_hero_location = pickRandom(ccs);		
	
	//start techs
	cmpTrigger.DoAfterDelay(2 * 1000,"ResearchTechs",null);
	
	//garrisons
	cmpTrigger.DoAfterDelay(4 * 1000,"GarrisonEntities",null);
	
	//patrols
	cmpTrigger.DoAfterDelay(10 * 1000,"IntervalSpawnAssyrianGuards",null);
	cmpTrigger.DoAfterDelay(8 * 1000,"SpawnAssyrianGuards",null);
	
	//check for ccs
	cmpTrigger.DoAfterDelay(15 * 1000,"CheckForCC",null);
	
	
	
	
	

	//disable templates
	for (let p of [1,2,3,4,5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		let disTemplates = disabledTemplates(cmpPlayer.GetCiv());
		
		if (p != 1)	
			cmpPlayer.SetDisabledTemplates(disTemplates);
		
		//add some tech
		let cmpTechnologyManager = Engine.QueryInterface(cmpPlayer.entity, IID_TechnologyManager);
	
		cmpTechnologyManager.ResearchTechnology("phase_town_generic");
		cmpTechnologyManager.ResearchTechnology("phase_city_generic");
	
		//no pop limit
		if (p == 1)
		{
			cmpTechnologyManager.ResearchTechnology("unlock_shared_los");
			cmpPlayer.SetPopulationBonuses(300);
			
			//set some specific disabled templates, e.g., no embassies or super ports yet, also no civil centre
			let dis_templates_human = ["structures/cart/embassy_celtic","structures/cart/embassy_italic","structures/cart/embassy_iberian","structures/cart/super_dock"];
			cmpPlayer.SetDisabledTemplates(dis_templates_human);
		}
		else if (p == 2)
		{
			cmpPlayer.SetPopulationBonuses(200);
		}
		else if (p == 5)
		{
			cmpPlayer.SetPopulationBonuses(0);
		}
	}
	
	//diplomacy
	
	for (let p of [1])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [5])
		{
			cmpPlayer.SetNeutral(p_other);
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
		
	}
	
	for (let p of [5])
	{
		let cmpPlayer = QueryPlayerIDInterface(p);
		for (let p_other of [2,3,4])
		{
			cmpPlayer.SetNeutral(p_other);
			let cmpPlayer_other = QueryPlayerIDInterface(p_other);
			cmpPlayer_other.SetNeutral(p);
		}
	}
	

	//triggers
	let data = { "enabled": true };
	
	/*cmpTrigger.RegisterTrigger("OnRange", "RangeActionElephantAmbush", {
		"entities": cmpTrigger.GetTriggerPoints(triggerPointsElephantAmbush), // central points to calculate the range circles
		"players": [1], // only count entities of player 1
		"maxRange": 15,
		"requiredComponent": IID_UnitAI, // only count units in range
		"enabled": true
	});
	
	*/
	
	cmpTrigger.RegisterTrigger("OnOwnershipChanged", "OwnershipChangedAction", data);
	//cmpTrigger.RegisterTrigger("OnStructureBuilt", "StructureBuiltAction", data);
	//cmpTrigger.RegisterTrigger("OnPlayerCommand", "PlayerCommandAction", data);

	
	cmpTrigger.RegisterTrigger("OnInterval", "IdleUnitCheck", {
		"enabled": true,
		"delay": 5 * 1000,
		"interval": 30 * 1000,
	});
	
	
	cmpTrigger.RegisterTrigger("OnInterval", "StructureDecayCheck", {
		"enabled": true,
		"delay": 10 * 1000,
		"interval": 10 * 1000,
	});
}




