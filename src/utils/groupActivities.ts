import {Activity} from "@/server/activities-server";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

type ActivityByDate = {
    date: string;
    activities: Activity[];
}

export function groupActivitiesByDate(activities: Activity[] | undefined): ActivityByDate[] {
    if (!activities) {
        return [{date: "", activities: []}];  // Return an empty structured response
    }

    const groupedActivities= activities.reduce((groupedActivities, activity) => {
        const dateKey = dayjs(activity.date).tz(dayjs.tz.guess()).format('YYYY-MM-DD');
        let dateGroup = groupedActivities.find(g => g.date === dateKey);

        if (!dateGroup) {
            dateGroup = {date: dateKey, activities: []};
            groupedActivities.push(dateGroup);
        }

        dateGroup.activities.push(activity);
        return groupedActivities;
    }, [] as ActivityByDate[]);

    groupedActivities.sort((a, b) => dayjs(a.date).isAfter(dayjs(b.date)) ? 1 : -1);
    
    return groupedActivities;

}
