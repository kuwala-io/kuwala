import com.uber.h3core.util.GeoCoord;
import io.kuwala.h3.H3;
import org.apache.commons.lang.StringUtils;
import org.hamcrest.MatcherAssert;
import org.junit.jupiter.api.*;
import org.neo4j.driver.*;
import org.neo4j.harness.Neo4j;
import org.neo4j.harness.Neo4jBuilders;
import java.util.List;

import static org.hamcrest.core.IsEqual.equalTo;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class H3Test {
    private static final Config driverConfig = Config.builder().withoutEncryption().build();
    private static Driver driver;
    private Neo4j embeddedDatabaseServer;

    @BeforeAll
    void initializeNeo4j() {
        this.embeddedDatabaseServer = Neo4jBuilders.newInProcessBuilder()
                .withDisabledServer()
                .withFunction(H3.class)
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
    public void shouldReturnCentroid() {
        Session session = driver.session();
        List<Double> result = session.run( "RETURN io.kuwala.h3.h3ToGeo('8f3f3040004caca') AS result")
                .single()
                .get("result")
                .asList(Value::asDouble);

        MatcherAssert.assertThat( result.get(0), equalTo(14.349714762386316) );
        MatcherAssert.assertThat( result.get(1), equalTo(35.96938114263836) );
    }

    @Test
    public void shouldReturnParentIndex() {
        Session session = driver.session();
        String result = session.run( "RETURN io.kuwala.h3.h3ToParent('8f3f3040004caca', 11) AS result").single().get("result").asString();

        MatcherAssert.assertThat( result, equalTo("8b3f3040004cfff") );
    }

    @Test
    public void shouldReturnNeighborsInRadius() {
        Session session = driver.session();
        List<String> result = session
                .run( "RETURN io.kuwala.h3.getNeighborsInRadius('8b3f30453725fff', 11, 100) AS result")
                .single()
                .get("result")
                .asList(Value::asString);

        MatcherAssert.assertThat(StringUtils.join(result, ','), equalTo("8b3f30453725fff,8b3f30453724fff,8b3f30453720fff,8b3f30453721fff,8b3f304530d2fff,8b3f304530d6fff,8b3f3045308bfff,8b3f3045308afff,8b3f30453099fff,8b3f30453726fff,8b3f30453722fff,8b3f30453723fff,8b3f3045372efff,8b3f3045372cfff,8b3f304530d3fff,8b3f304530d0fff,8b3f304530d4fff,8b3f30453089fff,8b3f30453088fff"));
    }
}