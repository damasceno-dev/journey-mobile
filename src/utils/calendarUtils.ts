import dayjs, {Dayjs} from "dayjs"
import {CalendarUtils, DateData} from "react-native-calendars"
import {MarkedDates} from "react-native-calendars/src/types"

type OrderStartsAtAndEndsAt = {
  startsAt?: DateData
  endsAt?: DateData
  selectedDay: DateData
}

type FormatDatesInText = {
  startsAt: Dayjs
  endsAt: Dayjs
}

export type DatesSelected = {
  startsAt: DateData | undefined
  endsAt: DateData | undefined
  dates: MarkedDates
  formatDatesInText: string
}

function orderStartsAtAndEndsAt({
  startsAt,
  endsAt,
  selectedDay,
}: OrderStartsAtAndEndsAt): DatesSelected {
  if (!startsAt) {
    return {
      startsAt: selectedDay,
      endsAt: undefined,
      formatDatesInText: "",
      dates: getIntervalDates(selectedDay, selectedDay),
    }
  }

  if (startsAt && endsAt) {
    return {
      startsAt: selectedDay,
      endsAt: undefined,
      formatDatesInText: "",
      dates: getIntervalDates(selectedDay, selectedDay),
    }
  }

  if (selectedDay.timestamp <= startsAt.timestamp) {
    return {
      startsAt: selectedDay,
      endsAt: startsAt,
      dates: getIntervalDates(selectedDay, startsAt),
      formatDatesInText: formatDatesInText({
        startsAt: dayjs(selectedDay.dateString).utc(),
        endsAt: dayjs(startsAt.dateString).utc(),
      }),
    }
  }

  return {
    startsAt: startsAt,
    endsAt: selectedDay,
    dates: getIntervalDates(startsAt, selectedDay),
    formatDatesInText: formatDatesInText({
      startsAt: dayjs(startsAt.dateString).utc(),
      endsAt: dayjs(selectedDay.dateString).utc(),
    }),
  }
}

function formatDatesInText({ startsAt, endsAt }: FormatDatesInText) {
  return startsAt.utc().month() === endsAt.utc().month() ? `${startsAt.utc().date()} a ${endsAt.utc().date()} de ${startsAt.utc().format(
      "MMMM"
  )}` : `${startsAt.utc().date()} de ${startsAt.utc().format("MMMM")} a ${endsAt.utc().date()} de ${endsAt.utc().format("MMMM")}`
}

function getIntervalDates(startsAt: DateData, endsAt: DateData): MarkedDates {
  const start = dayjs(startsAt.dateString).utc();
  const end = dayjs(endsAt.dateString).utc();

  let currentDate = start
  const datesArray: string[] = []

  while (currentDate.isBefore(end) || currentDate.isSame(end)) {
    datesArray.push(currentDate.format("YYYY-MM-DD"))
    currentDate = currentDate.add(1, "day")
  }

  let interval: MarkedDates = {}

  datesArray.forEach((date) => {
    interval = {
      ...interval,
      [date]: {
        selected: true,
      },
    }
  })

  return interval
}

function convertStringToDateData(dateString: string): DateData {
  
  const date = new Date(dateString);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1, // Months are zero-based in JavaScript
    day: date.getDate(),
    timestamp: date.getTime(),
    dateString: date.toISOString().split('T')[0], // Get the date part of the ISO string
  };
}

export const calendarUtils = {
  orderStartsAtAndEndsAt,
  formatDatesInText,
  dateToCalendarDate: CalendarUtils.getCalendarDateString,
  convertStringToDateData,
  getIntervalDates
}
