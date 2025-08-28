import React, { useContext, useEffect, useState } from "react";
import ChartistGraph from "react-chartist";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { fetchUsers as apiFetchUsers } from "../api/users";
import ReportList from "../components/ReportList";
import ReportForm from "../components/ReportForm";
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
  Spinner,
} from "react-bootstrap";

// Use environment variable for API base URL
const API_BASE = process.env.REACT_APP_API_URL || process.env.VITE_API_URL || "http://localhost:8000";

function Dashboard() {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  const [loadingUser, setLoadingUser] = useState(true);
  const [visits, setVisits] = useState([]);
  const [allVisitsReport, setAllVisitsReport] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [users, setUsers] = useState([]);
  const [loadingVisits, setLoadingVisits] = useState(false);
  const [loadingAllVisits, setLoadingAllVisits] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [error, setError] = useState("");
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

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
          navigate("/auth/login", { replace: true });
        });
    } else {
      setLoadingUser(false);
    }
  }, [user, fetchUser, token, navigate]);

  useEffect(() => {
    if (!user || loadingUser) return;

    const fetchVisits = async () => {
      setLoadingVisits(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/visit/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          navigate("/auth/login", { replace: true });
          return;
        }

        const data = await response.json();
        if (response.ok) {
          setVisits(data.visits || []);
        } else {
          setError(data.error || "Failed to fetch visits.");
        }
      } catch (err) {
        console.error("Error fetching visits:", err);
        setError("An error occurred while fetching visits.");
      } finally {
        setLoadingVisits(false);
      }
    };

    fetchVisits();
  }, [user, loadingUser, token, navigate]);

  useEffect(() => {
    if (!user || loadingUser || user.role !== "admin") return;

    const fetchAllVisitsReport = async () => {
      setLoadingAllVisits(true);
      setError("");
      try {
        const response = await fetch(`${API_BASE}/report/all-visits`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            "X-User-Role": user.role,
          },
        });

        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          navigate("/auth/login", { replace: true });
          return;
        }

        const data = await response.json();
        if (response.ok) {
          setAllVisitsReport(data.report.visits || []);
        } else {
          setError(data.error || "Failed to fetch all visits report.");
        }
      } catch (err) {
        console.error("Error fetching all visits report:", err);
        setError("An error occurred while fetching the all visits report.");
      } finally {
        setLoadingAllVisits(false);
      }
    };

    fetchAllVisitsReport();
  }, [user, loadingUser, token, navigate]);

  useEffect(() => {
    if (!user || loadingUser) return;

    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const response = await fetch(`${API_BASE}/notification/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401 || response.status === 422) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          navigate("/auth/login", { replace: true });
          return;
        }

        const data = await response.json();
        if (response.ok) {
          setNotifications(data.notifications || []);
        } else {
          setError(data.error || "Failed to fetch notifications.");
        }
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("An error occurred while fetching notifications.");
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();
  }, [user, loadingUser, token, navigate]);

  useEffect(() => {
    if (!user || loadingUser || (user.role !== "admin" && user.role !== "marketer")) return;

    const loadUsers = async () => {
      setLoadingUsers(true);
      setError("");
      try {
        const data = await apiFetchUsers();
        setUsers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("An error occurred while fetching users.");
      } finally {
        setLoadingUsers(false);
      }
    };

    loadUsers();
  }, [user, loadingUser, navigate]);

  if (loadingUser || !user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  const totalVisits = visits.length;
  const doctorsVisited = new Set(visits.map((visit) => visit.doctor_name)).size;
  const activeUsers = (() => {
    const matched = users.filter((u) => {
      if (!u || typeof u !== "object") return false;
      return u.is_active === true || u.isActive === true || u.active === true || (typeof u.status === "string" && u.status.toLowerCase() === "active");
    });
    return matched.length > 0 ? matched.length : users.length;
  })();

  const recentVisits = visits.length;
  const upcomingAppointments = visits.filter((visit) =>
    moment(visit.visit_date).isAfter(moment())
  ).length;
  const unreadNotifications = notifications.filter((n) => !n.is_read).length;

  const profileFields = ["first_name", "last_name", "email"];
  const filledFields = profileFields.filter((field) => user[field] && user[field].trim() !== "").length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  const last7Days = Array.from({ length: 7 }, (_, i) =>
    moment().subtract(i, "days").format("ddd")
  ).reverse();
  const visitsLast7Days = last7Days.map((day) =>
    visits.filter((visit) =>
      moment(visit.visit_date).isSame(moment(day, "ddd"), "day")
    ).length
  );
  const followUpsLast7Days = last7Days.map((day) =>
    visits.filter((visit) =>
      moment(visit.visit_date).isSame(moment(day, "ddd"), "day") && visit.notes?.includes("follow-up")
    ).length
  );

  const visitTypes = {
    inPerson: visits.filter((visit) => !visit.notes?.includes("virtual")).length,
    virtual: visits.filter((visit) => visit.notes?.includes("virtual")).length,
    cancelled: 0,
  };
  const totalVisitTypes = visitTypes.inPerson + visitTypes.virtual + visitTypes.cancelled;
  const visitTypePercentages = totalVisitTypes
    ? [
        Math.round((visitTypes.inPerson / totalVisitTypes) * 100) + "%",
        Math.round((visitTypes.virtual / totalVisitTypes) * 100) + "%",
        Math.round((visitTypes.cancelled / totalVisitTypes) * 100) + "%",
      ]
    : ["0%", "0%", "0%"];

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setShowReportForm(true);
  };

  const handleSaveReport = () => {
    setSelectedReport(null);
    setShowReportForm(false);
  };

  const AdminMarketerDashboard = () => (
    <>
      <Container fluid>
        <Row>
          <Col xs="12" sm="6" lg="3" className="mb-4">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-chart-pie text-warning"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Total Visits</p>
                      <Card.Title as="h4">{loadingVisits ? "..." : totalVisits}</Card.Title>
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

          <Col xs="12" sm="6" lg="3" className="mb-4">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-user-md text-success"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Doctors Visited</p>
                      <Card.Title as="h4">{loadingVisits ? "..." : doctorsVisited}</Card.Title>
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

          <Col xs="12" sm="6" lg="3" className="mb-4">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-clock text-danger"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Pending Follow-Ups</p>
                      <Card.Title as="h4">{loadingVisits ? "..." : followUpsLast7Days.reduce((a, b) => a + b, 0)}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-clock mr-1"></i> In the last week
                </div>
              </Card.Footer>
            </Card>
          </Col>

          <Col xs="12" sm="6" lg="3" className="mb-4">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-user-tie text-primary"></i>
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Active Users</p>
                      <Card.Title as="h4">{loadingUsers ? "..." : activeUsers}</Card.Title>
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

        <Row>
          <Col xs="12" md="8" className="mb-4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Visit Trends</Card.Title>
                <p className="card-category">Last 7 Days Performance</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartHours">
                  <ChartistGraph
                    data={{
                      labels: last7Days,
                      series: [visitsLast7Days, followUpsLast7Days],
                    }}
                    type="Line"
                    options={{
                      low: 0,
                      high: Math.max(...visitsLast7Days, ...followUpsLast7Days, 5),
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
                  <i className="fa fa-circle text-info"></i> Visits
                  <i className="fa fa-circle text-danger"></i> Follow-Ups
                </div>
                <hr />
                <div className="stats">
                  <i className="fas fa-history"></i> Updated just now
                </div>
              </Card.Footer>
            </Card>
          </Col>

          <Col xs="12" md="4" className="mb-4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Visit Summary</Card.Title>
                <p className="card-category">Visit Types This Month</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart ct-perfect-fourth" id="chartPreferences">
                  <ChartistGraph
                    data={{
                      labels: visitTypePercentages,
                      series: [visitTypes.inPerson, visitTypes.virtual, visitTypes.cancelled],
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
                  <i className="fa fa-circle text-info"></i> In-Person
                  <i className="fa fa-circle text-warning"></i> Virtual
                  <i className="fa fa-circle text-danger"></i> Cancelled
                </div>
                <hr />
                <div className="stats">
                  <i className="far fa-clock"></i> Updated today
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col xs="12" md="6" className="mb-4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Monthly Visits</Card.Title>
                <p className="card-category">Visits per Month This Year</p>
              </Card.Header>
              <Card.Body>
                <div className="ct-chart" id="chartActivity">
                  <ChartistGraph
                    data={{
                      labels: [
                        "Jan", "Feb", "Mar", "Apr", "May", "Jun",
                        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
                      ],
                      series: [
                        Array(12).fill(0).map((_, i) =>
                          visits.filter((visit) =>
                            moment(visit.visit_date).month() === i
                          ).length
                        ),
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
                  <i className="fas fa-circle text-info"></i> Total Visits
                </div>
                <hr />
                <div className="stats">
                  <i className="fas fa-check"></i> Data updated
                </div>
              </Card.Footer>
            </Card>
          </Col>
          <Col xs="12" md="6" className="mb-4">
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
                            placement="top"
                            overlay={<Tooltip id="tooltip-488980961">Edit Task..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
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
                            placement="top"
                            overlay={<Tooltip id="tooltip-537440761">Edit Task..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
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
                            placement="top"
                            overlay={<Tooltip id="tooltip-577232198">Edit Task..</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-edit"></i>
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
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
                  <i className="now-ui-icons loader_refresh spin"></i> Updated just now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>

        {user.role === "admin" && (
          <Row>
            <Col xs="12" className="mb-4">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">All Visits Report</Card.Title>
                  <p className="card-category">Complete list of all recorded visits</p>
                </Card.Header>
                <Card.Body>
                  {loadingAllVisits ? (
                    <div className="text-center">
                      <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    </div>
                  ) : allVisitsReport.length === 0 ? (
                    <p className="text-center">No visits found.</p>
                  ) : (
                    <Table striped bordered hover>
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>User ID</th>
                          <th>Doctor Name</th>
                          <th>Location</th>
                          <th>Visit Date</th>
                          <th>Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allVisitsReport.map((visit) => (
                          <tr key={visit.id}>
                            <td>{visit.id}</td>
                            <td>{visit.user_id}</td>
                            <td>{visit.doctor_name}</td>
                            <td>{visit.location}</td>
                            <td>{new Date(visit.visit_date).toLocaleDateString()}</td>
                            <td>{visit.notes}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  )}
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
        )}

        <ReportList user={user} token={token} role={user.role} onEdit={handleEditReport} />
      </Container>
    </>
  );

  const UserDashboard = () => {
    const upcomingVisits = visits
      .filter((visit) => moment(visit.visit_date).isAfter(moment()))
      .sort((a, b) => moment(a.visit_date).diff(moment(b.visit_date)))
      .slice(0, 5);

    return (
      <>
        <Container fluid>
          <Row>
            <Col xs="12" sm="6" lg="3" className="mb-4">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-calendar-alt text-primary"></i>
                    </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Recent Visits</p>
                        <Card.Title as="h4">{loadingVisits ? "..." : recentVisits}</Card.Title>
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

            <Col xs="12" sm="6" lg="3" className="mb-4">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-clock text-warning"></i>
                    </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Upcoming Appointments</p>
                        <Card.Title as="h4">{loadingVisits ? "..." : upcomingAppointments}</Card.Title>
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

            <Col xs="12" sm="6" lg="3" className="mb-4">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-bell text-danger"></i>
                    </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Notifications</p>
                        <Card.Title as="h4">{loadingNotifications ? "..." : unreadNotifications}</Card.Title>
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

            <Col xs="12" sm="6" lg="3" className="mb-4">
              <Card className="card-stats">
                <Card.Body>
                  <Row>
                    <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-user text-success"></i>
                    </div>
                    </Col>
                    <Col xs="7">
                      <div className="numbers">
                        <p className="card-category">Profile Completion</p>
                        <Card.Title as="h4">{loadingUser ? "..." : `${profileCompletion}%`}</Card.Title>
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

          <Row>
            <Col xs="12" md="8" className="mb-4">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Recent Activity</Card.Title>
                  <p className="card-category">Your activity over the last 7 days</p>
                </Card.Header>
                <Card.Body>
                  <div className="ct-chart" id="chartActivity">
                    <ChartistGraph
                      data={{
                        labels: last7Days,
                        series: [visitsLast7Days, followUpsLast7Days],
                      }}
                      type="Line"
                      options={{
                        low: 0,
                        high: Math.max(...visitsLast7Days, ...followUpsLast7Days, 5),
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
                    <i className="fa fa-circle text-info"></i> Visits
                    <i className="fa fa-circle text-warning"></i> Follow-Ups
                  </div>
                  <hr />
                  <div className="stats">
                    <i className="fas fa-history"></i> Updated just now
                  </div>
                </Card.Footer>
              </Card>
            </Col>

            <Col xs="12" md="4" className="mb-4">
              <Card>
                <Card.Header>
                  <Card.Title as="h4">Visit Summary</Card.Title>
                  <p className="card-category">Your visit types this month</p>
                </Card.Header>
                <Card.Body>
                  <div className="ct-chart ct-perfect-fourth" id="chartVisitSummary">
                    <ChartistGraph
                      data={{
                        labels: visitTypePercentages,
                        series: [visitTypes.inPerson, visitTypes.virtual, visitTypes.cancelled],
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
                    <i className="fa fa-circle text-info"></i> In-Person
                    <i className="fa fa-circle text-warning"></i> Virtual
                    <i className="fa fa-circle text-danger"></i> Cancelled
                  </div>
                  <hr />
                  <div className="stats">
                    <i className="far fa-clock"></i> Updated today
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row>
            <Col xs="12" md="6" className="mb-4">
              <Card className="card-tasks">
                <Card.Header>
                  <Card.Title as="h4">Upcoming Appointments</Card.Title>
                  <p className="card-category">Your scheduled visits</p>
                </Card.Header>
                <Card.Body>
                  <div className="table-full-width">
                    {loadingVisits ? (
                      <div className="text-center">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                    ) : upcomingVisits.length === 0 ? (
                      <p className="text-center">No upcoming appointments.</p>
                    ) : (
                      <Table>
                        <tbody>
                          {upcomingVisits.map((visit, index) => (
                            <tr key={index}>
                              <td>
                                <Form.Check className="mb-1 pl-0">
                                  <Form.Check.Label>
                                    <Form.Check.Input defaultValue="" type="checkbox"></Form.Check.Input>
                                    <span className="form-check-sign"></span>
                                  </Form.Check.Label>
                                </Form.Check>
                              </td>
                              <td>
                                {visit.doctor_name} - {visit.location}, {moment(visit.visit_date).format("MMM D, YYYY")}
                              </td>
                              <td className="td-actions text-right">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip id={`tooltip-view-${index}`}>View Details</Tooltip>}
                                >
                                  <Button className="btn-simple btn-link p-1" type="button" variant="info">
                                    <i className="fas fa-eye"></i>
                                  </Button>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={<Tooltip id={`tooltip-cancel-${index}`}>Cancel</Tooltip>}
                                >
                                  <Button className="btn-simple btn-link p-1" type="button" variant="danger">
                                    <i className="fas fa-times"></i>
                                  </Button>
                                </OverlayTrigger>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
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

            <Col xs="12" md="6" className="mb-4">
              <Card className="card-tasks">
                <Card.Header>
                  <Card.Title as="h4">Notifications</Card.Title>
                  <p className="card-category">Recent updates for you</p>
                </Card.Header>
                <Card.Body>
                  <div className="table-full-width">
                    {loadingNotifications ? (
                      <div className="text-center">
                        <Spinner animation="border" role="status">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </div>
                    ) : notifications.length === 0 ? (
                      <p className="text-center">No notifications.</p>
                    ) : (
                      <Table>
                        <tbody>
                          {notifications.slice(0, 5).map((notification, index) => (
                            <tr key={index}>
                              <td>
                                <i className={`fa fa-bell ${notification.is_read ? "text-muted" : "text-danger"} mr-2`}></i>
                              </td>
                              <td>{notification.message}</td>
                              <td className="td-actions text-right">
                                {!notification.is_read && (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={<Tooltip id={`tooltip-mark-read-${index}`}>Mark as Read</Tooltip>}
                                  >
                                    <Button className="btn-simple btn-link p-1" type="button" variant="info">
                                      <i className="fas fa-check"></i>
                                    </Button>
                                  </OverlayTrigger>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
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

          <Row className="mb-4">
            <Col xs="12" className="text-right">
              <Button variant="primary" onClick={() => setShowReportForm(true)}>
                Create New Report
              </Button>
            </Col>
          </Row>
          <ReportList user={user} token={token} role={user.role} onEdit={handleEditReport} />
        </Container>

        <ReportForm
          show={showReportForm}
          onHide={() => {
            setShowReportForm(false);
            setSelectedReport(null);
          }}
          token={token}
          user={user}
          report={selectedReport}
          visits={visits}
          onSave={handleSaveReport}
        />
      </>
    );
  };

  return user.role === "admin" || user.role === "marketer" ? (
    <AdminMarketerDashboard />
  ) : (
    <UserDashboard />
  );
}

export default Dashboard;