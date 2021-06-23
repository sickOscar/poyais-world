import {Component} from "../abstract/ecs/component";


const names = [
    "Dralil",
    "Adan",
    "Madli",
    "Drargir",
    "Dravion",
    "Duvli",
    "Dralil",
    "Dolin",
    "Alli",
    "Dravir",
    "Daniol",
    "Ralgiol",
    "Dagrli",
    "Glorgir",
    "Balgin",
    "Agli",
    "Dagir",
    "Dilvon",
    "Bodon",
    "Bagol",
    "Glolir",
    "Avin",
    "Avion",
    "Rumiol",
    "Glonli",
    "Githol",
    "Gavon",
    "Drandion",
    "Ailvli",
    "Bodil",
    "Glolvol",
    "Gartor",
    "Bothur",
    "Dodor",
    "Randan",
    "Aivin",
    "Glovil",
    "Bagan",
    "Mandil",
    "Dugin",
    "Mavur",
    "Dragrli",
    "Dalvli",
    "Bogur",
    "Maror",
    "Dodli",
    "Danon",
    "Dirgol",
    "Dunor",
    "Gloniol",
    "Glonan",
    "Gagur",
    "Thogriol",
    "Manur",
    "Bagrol",
    "Dagril",
    "Boron",
    "Airgur",
    "Dartil",
    "Bolin"
]


export class HumanStatsComponent implements Component {

    name = "HUMAN-STATS";

    characterName: string;
    characterSurname: string;
    characterFullName:string;
    age: number;
    max_age: number;
    health: number;
    weight: number;
    height: number;
    fatigue: number;
    fatigue_threshold:number;
    max_fatigue:number;
    thirst: number;
    max_thirst: number;
    thirst_threshold: number;
    boredom: number;
    max_boredom: number;

    constructor() {
        this.characterName = names[Math.round(Math.random()*(names.length - 1))];
        this.characterSurname = `son of ${names[Math.round(Math.random()*(names.length-1))]}`;
        this.characterFullName = `${this.characterName} ${this.characterSurname}`;
        this.age = 0;
        this.max_age = 100 + Math.round(Math.random() * 20);
        this.health = 50 + Math.round(Math.random() * 100);
        this.weight = 50 + Math.round(Math.random() * 100)
        this.height = 100 + Math.round(Math.random() * 50);
        this.fatigue = 0;
        this.fatigue_threshold = 100;
        this.max_fatigue = 200 + Math.round(Math.random() * 100);
        this.thirst = 0;
        this.max_thirst = 100 + Math.round(Math.random() * 50);
        this.thirst_threshold = this.max_thirst / 2;
        this.boredom = 0;
        this.max_boredom =  Math.round(Math.random() * 20);
    }

}