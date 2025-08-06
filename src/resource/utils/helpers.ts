const days = ["Sunday", "Monday", "Tuesday", "Wednesday",
  "Thursday", "Friday", "Saturday"]
const months = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "Octobor", "November", "December"]

/**
 * Function to change chars such as ', ",
 * @param {string} str 
 * @returns string removed all such chars
 */
export const makeTextSafe = (str: string) =>
  str ? str.replace(/\\/g, '\\\\').replace(/'/g, "''") : ""

/**
* Function to recover chars such as ', ",
* @param {string} str 
* @returns string recovered all such chars
*/
export const recoverText = (str: string) =>
  str ? str.replace(/''/g, "'") : ""


/**
 * Function to get date & time-string as format
 * @param {string} format 
 ** Y: Full year as 4 numbers
 ** D: Full day as 01 - 31
 ** H: Full hour as 00 - 23
 ** M: Full minute as 00 - 59
 ** m: Full month as 01 - 12
 ** S: Full second as 00 - 59
 ** d: Day: Sunday - Saturday
 ** N: Month text: January - November
 * @param {date} date 
 * @param {number} timezone 
 * @returns {string} date & time-string formatted
 */
export const now = (format: string, date?: Date, UTC: boolean = false): string => {
  let curDate = date || new Date(),
    year = UTC ? curDate.getUTCFullYear() : curDate.getFullYear(),
    month = UTC ? (curDate.getUTCMonth() + 1) : (curDate.getMonth() + 1),
    dateValue = UTC ? curDate.getUTCDate() : curDate.getDate(),
    hour = UTC ? curDate.getUTCHours() : curDate.getHours(),
    minute = UTC ? curDate.getUTCMinutes() : curDate.getMinutes(),
    second = UTC ? curDate.getUTCSeconds() : curDate.getSeconds(),
    day = days[UTC ? curDate.getUTCDay() : curDate.getDay()],
    monthName = months[UTC ? curDate.getUTCMonth() : curDate.getMonth()];

  return format
    .replace('Y', year.toString())
    .replace('m', month > 9 ? month.toString() : `0${month}`)
    .replace('D', dateValue > 9 ? dateValue.toString() : `0${dateValue}`)
    .replace('H', hour > 9 ? hour.toString() : `0${hour}`)
    .replace('M', minute > 9 ? minute.toString() : `0${minute}`)
    .replace('S', second > 9 ? second.toString() : `0${second}`)
    .replace('d', day)
    .replace('N', monthName)
    .trim();
};

export const getCensoredWordArray = (censoredStr: string | null) => {
  return censoredStr?.split(",").map(item => item.trim());
}

export const getCensoredMessage = (message: string, unallowedWords: string[]) => {
  // Create a regex pattern to match any of the unallowed words (case-insensitive, word-boundary-safe)
  const pattern = new RegExp(`\\b(${unallowedWords.join('|')})\\b`, 'gi');

  // Replace matched word with asterisks of same length
  return message.replace(pattern, (match) => '*'.repeat(match.length));
}

export const containsURL = (text: string) => {
  const regex = /https?:\/\/[^\s]+/i;
  return regex.test(text);
}

export const chatDate = (inputDate: string | "") => {

  if (inputDate == "" || inputDate == undefined || inputDate == null || inputDate == "undefined") {
    return "";
  }
  // Convert input date to a Date object
  const targetDate: Date = new Date(inputDate);

  // Get the current date
  const now: Date = new Date(new Date().toISOString());

  // Calculate the difference in milliseconds
  const differenceInMillis: number = now.getTime() - targetDate.getTime();

  // Convert milliseconds to other units
  const millisecondsInSecond: number = 1000;
  const millisecondsInMinute: number = millisecondsInSecond * 60;
  const millisecondsInHour: number = millisecondsInMinute * 60;
  const millisecondsInDay: number = millisecondsInHour * 24;

  const daysDifference: number = Math.floor(differenceInMillis / millisecondsInDay);
  const hoursDifference: number = Math.floor((differenceInMillis % millisecondsInDay) / millisecondsInHour);
  const minutesDifference: number = Math.floor((differenceInMillis % millisecondsInHour) / millisecondsInMinute);
  const secondsDifference: number = Math.floor((differenceInMillis % millisecondsInMinute) / millisecondsInSecond);

  return daysDifference > 0 
          ? daysDifference + "d ago" 
          : hoursDifference > 0 
            ? hoursDifference + "h ago" 
            : minutesDifference > 0 
              ? minutesDifference + "m ago" 
              : secondsDifference > 0 
                ? secondsDifference + "s ago" 
                : "Just now"
}

export function isValidGroupName(name: string): boolean {
  const groupNameRegex = /^[a-z0-9]+$/;
  return groupNameRegex.test(name);
}