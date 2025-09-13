export default class Day {
    date: number | null = null;
    day: number | null = null;
    month: number | null = null;
    year: number | null = null;
    data: Date = new Date();

    selected: boolean = false;
    today: boolean = false;
    fade: boolean = false;
}