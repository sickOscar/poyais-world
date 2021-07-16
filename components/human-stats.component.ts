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

export enum Gender {
    MALE = 'MALE',
    FEMALE = 'FEMALE'
}

export class HumanStatsComponent implements Component {

    name = "HUMAN-STATS";

    characterName: string;
    characterSurname: string;
    characterFullName:string;
    age: number;
    maxAge: number;
    health: number;
    height: number;
    fatigue: number;
    fatigueThreshold:number;
    maxFatigue:number;
    thirst: number;
    maxThirst: number;
    thirstThreshold: number;
    boredom: number;
    maxBoredom: number;
    gender:Gender;

    constructor() {
        this.characterName = names[Math.round(Math.random()*(names.length - 1))];
        this.characterSurname = `son of ${names[Math.round(Math.random()*(names.length-1))]}`;
        this.characterFullName = `${this.characterName} ${this.characterSurname}`;
        this.age = 0;
        this.maxAge = 100 + Math.round(Math.random() * 20);
        this.health = 50 + Math.round(Math.random() * 100);
        this.height = 100 + Math.round(Math.random() * 50);
        this.fatigue = 0;
        this.fatigueThreshold = 100;
        this.maxFatigue = 200 + Math.round(Math.random() * 100);
        this.thirst = 0;
        this.maxThirst = 100 + Math.round(Math.random() * 50);
        this.thirstThreshold = this.maxThirst / 2;
        this.boredom = 0;
        this.maxBoredom =  20 + Math.round(Math.random() * 10);
        this.gender = Math.random() > 0.5 ? Gender.MALE : Gender.FEMALE;
    }

}