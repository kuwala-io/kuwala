package io.kuwala.time;

import org.joda.time.DateTime;
import org.joda.time.format.DateTimeFormat;
import org.joda.time.format.DateTimeFormatter;
import org.neo4j.procedure.Description;
import org.neo4j.procedure.Name;
import org.neo4j.procedure.UserFunction;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;

public class Time {
    @UserFunction
    @Description("io.kuwala.time.durationHours(start, end) - Returns the duration of two datetimes in hours.")
    public double durationHours(
            @Name("start") String start,
            @Name("end") String end
    ) throws ParseException {
        SimpleDateFormat inFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX");
        Date startDate = inFormat.parse(start);
        Date endDate = inFormat.parse(end);
        Duration d = Duration.between(startDate.toInstant(), endDate.toInstant());

        return d.toHours();
    }

    @UserFunction
    @Description("io.kuwala.time.getHour(datetime) - Returns the hour of a given datetime.")
    public double getHour(@Name("datetime") String datetime) {
        DateTimeFormatter fmt = DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ssZ").withOffsetParsed();
        DateTime dt = fmt.parseDateTime(datetime.replace(".", ""));

        return dt.getHourOfDay();
    }
}


