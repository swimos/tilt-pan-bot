package swim.facedetect;

import java.io.IOException;
import swim.api.SwimAgent;
import swim.api.SwimRoute;
import swim.api.agent.AgentType;
import swim.api.plane.AbstractPlane;
import swim.api.plane.Plane;
import swim.api.plane.PlaneContext;
import swim.api.server.ServerContext;
import swim.loader.ServerLoader;
import swim.structure.Value;
import swim.uri.Uri;
import swim.uri.UriPattern;

import swim.facedetect.agent.GamePadAgent;
import swim.facedetect.agent.PredictionsAgent;
import swim.facedetect.agent.RobotStateAgent;
import swim.facedetect.introspection.IntrospectionAgent;

public class FaceDetectPlane extends AbstractPlane {

  @SwimAgent(name = "gamePad")
  @SwimRoute("/gamePad/:padId/:channel")
  final AgentType<GamePadAgent> gamePadAgent = agentClass(GamePadAgent.class);

  @SwimAgent(name = "facePredictions")
  @SwimRoute("/predictions/:predictionName")
  final AgentType<PredictionsAgent> facePredictionAgent = agentClass(PredictionsAgent.class);

  @SwimAgent(name = "introspection")
  @SwimRoute("/introspection")
  final AgentType<?> introspectionService = agentClass(IntrospectionAgent.class);

  @SwimAgent(name = "robotState")
  @SwimRoute("/robotState")
  final AgentType<?> robotStateService = agentClass(RobotStateAgent.class);

  public static void main(String[] args) throws IOException, InterruptedException {
    final ServerContext server = ServerLoader.load(FaceDetectPlane.class.getModule()).serverContext();
    final PlaneContext plane = server.getPlane("facedetect").planeContext();
    server.start();
    plane.command("/introspection", "init", Value.absent());
    System.out.println("Running Face Detect Plane...");

    server.run();

  }

}
