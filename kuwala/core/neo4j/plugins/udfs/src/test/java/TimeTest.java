import io.kuwala.time.Time;
import org.hamcrest.MatcherAssert;
import org.junit.jupiter.api.*;
import org.neo4j.driver.*;
import org.neo4j.harness.Neo4j;
import org.neo4j.harness.Neo4jBuilders;

import static org.hamcrest.core.IsEqual.equalTo;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class TimeTest {
    private static final Config driverConfig = Config.builder().withoutEncryption().build();
    private static Driver driver;
    private Neo4j embeddedDatabaseServer;

    @BeforeAll
    void initializeNeo4j() {
        this.embeddedDatabaseServer = Neo4jBuilders.newInProcessBuilder()
                .withDisabledServer()
                .withFunction(Time.class)
                .build();

        driver = GraphDatabase.driver(embeddedDatabaseServer.boltURI(), driverConfig);
    }

    @AfterAll
    void closeDriver() {
        driver.close();
        this.embeddedDatabaseServer.close();
    }

    @AfterEach
    void cleanDb() {
        try(Session session = driver.session()) {
            session.run("MATCH (n) DETACH DELETE n");
        }
    }

    @Test
    public void shouldReturnParentIndex() {
        Session session = driver.session();
        double result = session.run(
        "RETURN io.kuwala.time.durationHours('2021-07-05T08:00:00-00.00', '2021-07-05T16:00:00-00.00') AS result"
        ).single().get("result").asDouble();

        MatcherAssert.assertThat( result, equalTo(8.0) );
    }

    @Test
    public void shouldReturnHour() {
        Session session = driver.session();
        double result = session.run(
                "RETURN io.kuwala.time.getHour('2021-07-05T08:00:00-00.00') AS result"
        ).single().get("result").asDouble();

        MatcherAssert.assertThat( result, equalTo(8.0) );
    }
}