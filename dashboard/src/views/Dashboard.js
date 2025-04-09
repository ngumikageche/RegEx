import React, { useContext, useEffect, useState } from "react";
import ChartistGraph from "react-chartist";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
// react-bootstrap components
import {
  Badge,
  Button,
  Card,
  Container,
  Row,
  Col,
  Form,
  OverlayTrigger,
  Tooltip,
  Table,
} from "react-bootstrap";

function Dashboard() {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  const [loadingUser, setLoadingUser] = useState(true);

  // Fetch user data on mount
  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!user) {
      setLoadingUser(true);
      fetchUser(token)
        .then(() => {
          setLoadingUser(false);
        })
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          navigate("/auth/login", { replace: true });
        });
    } else {
      setLoadingUser(false);
    }
  }, [user, fetchUser, token, navigate]);

  if (loadingUser || !user) {
    return (
      <Container className="mt-5 text-center">
        <div>Loading user data...</div>
      </Container>
    );
  }

  // Admin/Marketer Dashboard
  const AdminMarketerDashboard = () => (
    <>
      <Container fluid>
        {/* Row 1: Admin/Marketer Metrics */}
        <Row>
          {/* Total Visits */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-chart text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Total Visits</p>
                      <Card.Title as="h4">120</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i> Updated now
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Doctors Visited */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-single-02 text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Doctors Visited</p>
                      <Card.Title as="h4">45</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i> Last update
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Pending Follow-Ups */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-time-alarm text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Pending Follow-Ups</p>
                      <Card.Title as="h4">10</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-clock mr-1"></i> In the last hour
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Active Marketers */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-badge text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Active Marketers</p>
                      <Card.Title as="h4">5</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i> Updated now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Row 2: Admin/Marketer Charts */}
        <Row>
          {/* Users Behavior Chart */}
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Users Behavior</Card.Title>
                <p className="card-category">24 Hours Performance</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={{
                      labels: [
                        "9:00AM",
                        "12:00PM",
                        "3:00PM",
                        "6:00PM",
                        "9:00PM",
                        "12:00AM",
                        "3:00AM",
                        "6:00AM",
                      ],
                      series: [
                        [287, 385, 490, 492, 554, 586, 698, 695], // Open
                        [67, 152, 143, 240, 287, 335, 435, 437], // Click
                        [23, 113, 67, 108, 190, 239, 307, 308], // Click Second Time
                      ],
                    }}
                    type="Line"
                    options={{
                      low: 0,
                      high: 800,
                      showArea: false,
                      height: "250px",
                      axisX: { showGrid: false },
                      lineSmooth: true,
                      showLine: true,
                      showPoint: true,
                      fullWidth: true,
                      chartPadding: { right: 50 },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> Open
                  <i className="fas fa-circle text-danger"></i> Click
                  <i className="fas fa-circle text-warning"></i> Click Second Time
                </div>
                <hr />
                <div className="stats">
                  <i className="fas fa-history"></i> Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Email Statistics Chart */}
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Email Statistics</Card.Title>
                <p className="card-category">Last Campaign Performance</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart ct-perfect-fourth" id="chartPreferences">
                  <ChartistGraph
                    data={{
                      labels: ["40%", "20%", "40%"],
                      series: [40, 20, 40],
                    }}
                    type="Pie"
                    options={{
                      donut: true,
                      donutWidth: 40,
                      startAngle: 0,
                      showLabel: true,
                    }}
                  />
                </div>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> Open
                  <i className="fas fa-circle text-danger"></i> Bounce
                  <i className="fas fa-circle text-warning"></i> Unsubscribe
                </div>
                <hr />
                <div className="stats">
                  <i className="far fa-clock"></i> Campaign sent 2 days ago
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Row 3: Admin/Marketer Charts and Tasks */}
        <Row>
          <Col md="6">
            <Card>
              <Card.Header>
                <Card.Title as="h4">2017 Sales</Card.Title>
                <p className="card-category">All products including Taxes</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartActivity">
                  <ChartistGraph
                    data={{
                      labels: [
                        "Jan",
                        "Feb",
                        "Mar",
                        "Apr",
                        "Mai",
                        "Jun",
                        "Jul",
                        "Aug",
                        "Sep",
                        "Oct",
                        "Nov",
                        "Dec",
                      ],
                      series: [
                        [542, 443, 320, 780, 553, 453, 326, 434, 568, 610, 756, 895],
                        [412, 243, 280, 580, 453, 353, 300, 364, 368, 410, 636, 695],
                      ],
                    }}
                    type="Bar"
                    options={{
                      seriesBarDistance: 10,
                      axisX: { showGrid: false },
                      height: "245px",
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          seriesBarDistance: 5,
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> Tesla Model S
                  <i className="fas fa-circle text-danger"></i> BMW 5 Series
                </div>
                <hr />
                <div className="stats">
                  <i className="fas fa-check"></i> Data information certified
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col md="6">
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Tasks</Card.Title>
                <p className="card-category">Backend development</p>
              </Card.Header>
              <Card.Body>
                <div className="table-full-width">
                  <Table>
                    <tbody>
                      <tr>
                        <td>
                          <Form.Check className="mb-1 pl-0">
                            <Form.Check.Label>
                              <Form.Check.Input defaultValue="" type="checkbox"></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                        </td>
                        <td>Sign contract for "What are conference organizers afraid of?"</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-488980961">Edit Task..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-506045838">Remove..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="danger">
                              <i className="fas fa-times"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Form.Check className="mb-1 pl-0">
                            <Form.Check.Label>
                              <Form.Check.Input defaultChecked defaultValue="" type="checkbox"></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                        </td>
                        <td>Lines From Great Russian Literature? Or E-mails From My Boss?</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-537440761">Edit Task..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-21130535">Remove..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="danger">
                              <i className="fas fa-times"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Form.Check className="mb-1 pl-0">
                            <Form.Check.Label>
                              <Form.Check.Input defaultChecked defaultValue="" type="checkbox"></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                        </td>
                        <td>Flooded: One year later, assessing what was lost and what was found</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-577232198">Edit Task..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-773861645">Remove..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="danger">
                              <i className="fas fa-times"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin"></i> Updated 3 minutes ago
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );

  // User Dashboard
  const UserDashboard = () => (
    <>
      <Container fluid>
        {/* Row 1: User-Specific Metrics */}
        <Row>
          {/* Recent Visits */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-calendar-60 text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Recent Visits</p>
                      <Card.Title as="h4">3</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1"></i> Updated now
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Upcoming Appointments */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-time-alarm text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Upcoming Appointments</p>
                      <Card.Title as="h4">2</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1"></i> This week
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Notifications */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-bell-55 text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Notifications</p>
                      <Card.Title as="h4">5</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-clock mr-1"></i> Unread
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Profile Completion */}
          <Col lg="3" sm="6">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5">
                    <div className="icon-big text-center icon-warning">
                      <i className="nc-icon nc-single-02 text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Profile Completion</p>
                      <Card.Title as="h4">75%</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-check mr-1"></i> Update now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {/* Row 2: User Charts */}
        <Row>
          {/* Recent Activity Timeline */}
          <Col md="8">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Recent Activity</Card.Title>
                <p className="card-category">Your activity over the last 7 days</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartActivity">
                  <ChartistGraph
                    data={{
                      labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
                      series: [
                        [2, 1, 3, 0, 1, 2, 0], // Visits
                        [1, 0, 2, 1, 0, 1, 0], // Follow-Ups
                      ],
                    }}
                    type="Line"
                    options={{
                      low: 0,
                      high: 5,
                      showArea: false,
                      height: "250px",
                      axisX: { showGrid: false },
                      lineSmooth: true,
                      showLine: true,
                      showPoint: true,
                      fullWidth: true,
                      chartPadding: { right: 50 },
                    }}
                    responsiveOptions={[
                      [
                        "screen and (max-width: 640px)",
                        {
                          axisX: {
                            labelInterpolationFnc: function (value) {
                              return value[0];
                            },
                          },
                        },
                      ],
                    ]}
                  />
                </div>
              </Card.Body>
              <Card.Footer>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> Visits
                  <i className="fas fa-circle text-warning"></i> Follow-Ups
                </div>
                <hr />
                <div className="stats">
                  <i className="fas fa-history"></i> Updated just now
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Visit Summary Pie Chart */}
          <Col md="4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Visit Summary</Card.Title>
                <p className="card-category">Your visit types this month</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart ct-perfect-fourth" id="chartVisitSummary">
                  <ChartistGraph
                    data={{
                      labels: ["60%", "30%", "10%"],
                      series: [60, 30, 10],
                    }}
                    type="Pie"
                    options={{
                      donut: true,
                      donutWidth: 40,
                      startAngle: 0,
                      showLabel: true,
                    }}
                  />
                </div>
                <div className="legend">
                  <i className="fas fa-circle text-info"></i> In-Person
                  <i className="fas fa-circle text-warning"></i> Virtual
                  <i className="fas fa-circle text-danger"></i> Cancelled
                </div>
                <hr />
                <div className="stats">
                  <i className="far fa-clock"></i> Updated today
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* Row 3: User Tables */}
        <Row>
          {/* Upcoming Appointments */}
          <Col md="6">
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Upcoming Appointments</Card.Title>
                <p className="card-category">Your scheduled visits</p>
              </Card.Header>
              <Card.Body>
                <div className="table-full-width">
                  <Table>
                    <tbody>
                      <tr>
                        <td>
                          <Form.Check className="mb-1 pl-0">
                            <Form.Check.Label>
                              <Form.Check.Input defaultValue="" type="checkbox"></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                        </td>
                        <td>Dr. Smith - City Hospital, Apr 10, 2025</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-1">View Details</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-eye"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-2">Cancel</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="danger">
                              <i className="fas fa-times"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Form.Check className="mb-1 pl-0">
                            <Form.Check.Label>
                              <Form.Check.Input defaultValue="" type="checkbox"></Form.Check.Input>
                              <span className="form-check-sign"></span>
                            </Form.Check.Label>
                          </Form.Check>
                        </td>
                        <td>Dr. Jones - Downtown Clinic, Apr 12, 2025</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-3">View Details</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-eye"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-4">Cancel</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="danger">
                              <i className="fas fa-times"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="now-ui-icons loader_refresh spin"></i> Updated just now
                </div>
              </Card.Footer>
            </Card>
          </Col>

          {/* Notifications */}
          <Col md="6">
            <Card className="card-tasks">
              <Card.Header>
                <Card.Title as="h4">Notifications</Card.Title>
                <p className="card-category">Recent updates for you</p>
              </Card.Header>
              <Card.Body>
                <div className="table-full-width">
                  <Table>
                    <tbody>
                      <tr>
                        <td>
                          <i className="nc-icon nc-bell-55 text-danger mr-2"></i>
                        </td>
                        <td>Appointment confirmed with Dr. Smith on Apr 10</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-5">Mark as Read</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-check"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="nc-icon nc-bell-55 text-danger mr-2"></i>
                        </td>
                        <td>Reminder: Follow-up with Dr. Jones on Apr 12</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-6">Mark as Read</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-check"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <i className="nc-icon nc-bell-55 text-danger mr-2"></i>
                        </td>
                        <td>Profile update required to access new features</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            overlay={<Tooltip id="tooltip-7">Mark as Read</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-check"></i>
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-history"></i> Updated just now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );

  // Conditionally render the dashboard based on user role
  return user.role === "admin" || user.role === "marketer" ? (
    <AdminMarketerDashboard />
  ) : (
    <UserDashboard />
  );
}

export default Dashboard;