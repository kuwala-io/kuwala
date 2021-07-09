package io.kuwala.moment;

import org.neo4j.procedure.Description;
import org.neo4j.procedure.Name;
import org.neo4j.procedure.UserFunction;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.time.Duration;
import java.util.Date;

public class Moment {
    @UserFunction
    @Description("io.kuwala.moment.durationHours(start, end) - Returns the duration of two datetimes in hours.")
    public double durationHours(
            @Name("start") String start,
            @Name("end") String end
    ) {
        double duration = 0.0;

        try {
            SimpleDateFormat inFormat = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssX");
            Date startDate = inFormat.parse(start);
            Date endDate = inFormat.parse(end);
            Duration d = Duration.between(startDate.toInstant(), endDate.toInstant());
            duration = d.toHours();
        } catch (ParseException e) {
            e.printStackTrace();
        }

        return duration;
    }
}


