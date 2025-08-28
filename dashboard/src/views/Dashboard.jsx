// src/pages/Dashboard.tsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import ChartistGraph from "react-chartist";
import { UserContext } from "../context/UserContext";
import { useNavigate } from "react-router-dom";
import { format, subDays, isAfter, parseISO } from "date-fns";
import { fetchUsers as apiFetchUsers } from "../api/users";
import ReportList from "../components/ReportList";
import ReportForm from "../components/ReportForm";
import {
  Alert,
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

// TypeScript interfaces for type safety
interface Visit {
  id: number;
  user_id: number;
  doctor_name: string;
  location: string;
  visit_date: string;
  notes?: string;
  status?: string;
}

interface Notification {
  id: number;
  message: string;
  is_read: boolean;
}

interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
}

// Custom hook for fetching dashboard data
const useDashboardData = (user: User | null, token: string | null, navigate: (path: string, options?: { replace: boolean }) => void) => {
  const [data, setData] = useState<{
    visits: Visit[];
    notifications: Notification[];
    users: User[];
    allVisitsReport: Visit[];
    tasks: Task[];
  }>({
    visits: [],
    notifications: [],
    users: [],
    allVisitsReport: [],
    tasks: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !token) return;
      setLoading(true);
      setError("");
      try {
        const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
        const [visitsRes, notificationsRes, usersRes, allVisitsRes, tasksRes] = await Promise.all([
          fetch(`${API_BASE}/visit/`, { headers }),
          fetch(`${API_BASE}/notification/`, { headers }),
          user.role === "admin" || user.role === "marketer" ? apiFetchUsers() : Promise.resolve({ users: [] }),
          user.role === "admin"
            ? fetch(`${API_BASE}/report/all-visits`, { headers: { ...headers, "X-User-Role": user.role } })
            : Promise.resolve({ report: { visits: [] } }),
          user.role === "admin" || user.role === "marketer"
            ? fetch(`${API_BASE}/tasks`, { headers })
            : Promise.resolve({ tasks: [] }),
        ]);

        if ([visitsRes.status, notificationsRes.status, allVisitsRes.status, tasksRes.status].includes(401)) {
          localStorage.removeItem("auth_token");
          localStorage.removeItem("user_role");
          navigate("/auth/login", { replace: true });
          return;
        }

        const visitsData = await visitsRes.json();
        const notificationsData = await notificationsRes.json();
        const allVisitsData = await allVisitsRes.json();
        const tasksData = await tasksRes.json();

        setData({
          visits: visitsData.visits || [],
          notifications: notificationsData.notifications || [],
          users: usersRes.users || [],
          allVisitsReport: allVisitsData.report?.visits || [],
          tasks: tasksData.tasks || [],
        });
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, token, navigate]);

  return { data, loading, error };
};

function Dashboard() {
  const { user, fetchUser } = useContext(UserContext);
  const navigate = useNavigate();
  const token = localStorage.getItem("auth_token");
  const [loadingUser, setLoadingUser] = useState(true);
  const [showReportForm, setShowReportForm] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Visit | null>(null);
  const { data, loading, error } = useDashboardData(user, token, navigate);

  useEffect(() => {
    if (!token) {
      navigate("/auth/login", { replace: true });
      return;
    }

    if (!user) {
      setLoadingUser(true);
      fetchUser(token)
        .then(() => setLoadingUser(false))
        .catch((err) => {
          console.error("Failed to fetch user data:", err);
          navigate("/auth/login", { replace: true });
        });
    } else {
      setLoadingUser(false);
    }
  }, [user, fetchUser, token, navigate]);

  if (loadingUser || !user) {
    return (
      <Container className="mt-5 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  // Metrics calculations
  const totalVisits = useMemo(() => data.visits.length, [data.visits]);
  const doctorsVisited = useMemo(() => new Set(data.visits.map((visit) => visit.doctor_name)).size, [data.visits]);
  const activeUsers = useMemo(() => data.users.filter((u) => u.is_active).length, [data.users]);
  const recentVisits = useMemo(() => data.visits.length, [data.visits]);
  const upcomingAppointments = useMemo(
    () => data.visits.filter((visit) => isAfter(parseISO(visit.visit_date), new Date())).length,
    [data.visits]
  );
  const unreadNotifications = useMemo(() => data.notifications.filter((n) => !n.is_read).length, [data.notifications]);

  const profileFields = ["first_name", "last_name", "email"];
  const filledFields = profileFields.filter((field) => user[field] && user[field].trim() !== "").length;
  const profileCompletion = Math.round((filledFields / profileFields.length) * 100);

  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), i), "EEE")).reverse();
  const visitsLast7Days = last7Days.map((day) =>
    data.visits.filter((visit) => format(parseISO(visit.visit_date), "EEE") === day).length
  );
  const followUpsLast7Days = last7Days.map((day) =>
    data.visits.filter(
      (visit) => format(parseISO(visit.visit_date), "EEE") === day && visit.notes?.includes("follow-up")
    ).length
  );

  const visitTypes = useMemo(
    () => ({
      inPerson: data.visits.filter((visit) => !visit.notes?.includes("virtual")).length,
      virtual: data.visits.filter((visit) => visit.notes?.includes("virtual")).length,
      cancelled: data.visits.filter((visit) => visit.status === "cancelled").length,
    }),
    [data.visits]
  );
  const totalVisitTypes = visitTypes.inPerson + visitTypes.virtual + visitTypes.cancelled;
  const visitTypePercentages = totalVisitTypes
    ? [
        Math.round((visitTypes.inPerson / totalVisitTypes) * 100) + "%",
        Math.round((visitTypes.virtual / totalVisitTypes) * 100) + "%",
        Math.round((visitTypes.cancelled / totalVisitTypes) * 100) + "%",
      ]
    : ["0%", "0%", "0%"];

  const handleEditReport = (report: Visit) => {
    setSelectedReport(report);
    setShowReportForm(true);
  };

  const handleSaveReport = () => {
    setSelectedReport(null);
    setShowReportForm(false);
  };

  const AdminMarketerDashboard = () => (
    <Container fluid>
      {error && (
        <Alert variant="danger" onClose={() => setError("")} dismissible>
          {error}
        </Alert>
      )}
      <Row>
        <Col xs="12" sm="6" lg="3" className="mb-4">
          <Card className="card-stats">
            <Card.Body>
              <Row>
                <Col xs="5" className="d-flex justify-content-center">
                  <div className="icon-big text-center icon-warning">
                    <i className="fa fa-chart-pie text-warning" aria-hidden="true" />
                  </div>
                </Col>
                <Col xs="7">
                  <div className="numbers">
                    <p className="card-category">Total Visits</p>
                    <Card.Title as="h4">{loading ? "..." : totalVisits}</Card.Title>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer>
              <hr />
              <div className="stats">
                <i className="fas fa-redo mr-1" aria-hidden="true" /> Updated now
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
                    <i className="fa fa-user-md text-success" aria-hidden="true" />
                  </div>
                </Col>
                <Col xs="7">
                  <div className="numbers">
                    <p className="card-category">Doctors Visited</p>
                    <Card.Title as="h4">{loading ? "..." : doctorsVisited}</Card.Title>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer>
              <hr />
              <div className="stats">
                <i className="far fa-calendar-alt mr-1" aria-hidden="true" /> Last update
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
                    <i className="fa fa-clock text-danger" aria-hidden="true" />
                  </div>
                </Col>
                <Col xs="7">
                  <div className="numbers">
                    <p className="card-category">Pending Follow-Ups</p>
                    <Card.Title as="h4">{loading ? "..." : followUpsLast7Days.reduce((a, b) => a + b, 0)}</Card.Title>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer>
              <hr />
              <div className="stats">
                <i className="far fa-clock mr-1" aria-hidden="true" /> In the last week
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
                    <i className="fa fa-user-tie text-primary" aria-hidden="true" />
                  </div>
                </Col>
                <Col xs="7">
                  <div className="numbers">
                    <p className="card-category">Active Users</p>
                    <Card.Title as="h4">{loading ? "..." : activeUsers}</Card.Title>
                  </div>
                </Col>
              </Row>
            </Card.Body>
            <Card.Footer>
              <hr />
              <div className="stats">
                <i className="fas fa-redo mr-1" aria-hidden="true" /> Updated now
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
                    high: Math.max(...visitsLast7Days, ...followUpsLast7Days, 1) + 1,
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
                          labelInterpolationFnc: (value: string) => value[0],
                        },
                      },
                    ],
                  ]}
                />
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="legend">
                <i className="fa fa-circle text-info" aria-hidden="true" /> Visits
                <i className="fa fa-circle text-danger" aria-hidden="true" /> Follow-Ups
              </div>
              <hr />
              <div className="stats">
                <i className="fas fa-history" aria-hidden="true" /> Updated just now
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
                <i className="fa fa-circle text-info" aria-hidden="true" /> In-Person
                <i className="fa fa-circle text-warning" aria-hidden="true" /> Virtual
                <i className="fa fa-circle text-danger" aria-hidden="true" /> Cancelled
              </div>
              <hr />
              <div className="stats">
                <i className="far fa-clock" aria-hidden="true" /> Updated today
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
                    labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                    series: [
                      Array(12)
                        .fill(0)
                        .map((_, i) => data.visits.filter((visit) => parseISO(visit.visit_date).getMonth() === i).length),
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
                          labelInterpolationFnc: (value: string) => value[0],
                        },
                      },
                    ],
                  ]}
                />
              </div>
            </Card.Body>
            <Card.Footer>
              <div className="legend">
                <i className="fas fa-circle text-info" aria-hidden="true" /> Total Visits
              </div>
              <hr />
              <div className="stats">
                <i className="fas fa-check" aria-hidden="true" /> Data updated
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
                    {data.tasks.map((task) => (
                      <tr key={task.id}>
                        <td>
                          <Form.Check className="mb-1 pl-0">
                            <Form.Check.Label>
                              <Form.Check.Input
                                defaultChecked={task.completed}
                                type="checkbox"
                                value={task.id}
                              />
                              <span className="form-check-sign" />
                            </Form.Check.Label>
                          </Form.Check>
                        </td>
                        <td>{task.title}</td>
                        <td className="td-actions text-right">
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`edit-task-${task.id}`}>Edit Task</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="info">
                              <i className="fas fa-edit" aria-hidden="true" />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={<Tooltip id={`remove-task-${task.id}`}>Remove</Tooltip>}
                          >
                            <Button className="btn-simple btn-link p-1" type="button" variant="danger">
                              <i className="fas fa-times" aria-hidden="true" />
                            </Button>
                          </OverlayTrigger>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer>
              <hr />
              <div className="stats">
                <i className="now-ui-icons loader_refresh spin" aria-hidden="true" /> Updated just now
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
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : data.allVisitsReport.length === 0 ? (
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
                      {data.allVisitsReport.map((visit) => (
                        <tr key={visit.id}>
                          <td>{visit.id}</td>
                          <td>{visit.user_id}</td>
                          <td>{visit.doctor_name}</td>
                          <td>{visit.location}</td>
                          <td>{format(parseISO(visit.visit_date), "MM/dd/yyyy")}</td>
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
                  <i className="fas fa-history" aria-hidden="true" /> Updated just now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      )}
      <ReportList user={user} token={token} role={user.role} onEdit={handleEditReport} />
    </Container>
  );

  const UserDashboard = () => {
    const upcomingVisits = useMemo(
      () =>
        data.visits
          .filter((visit) => isAfter(parseISO(visit.visit_date), new Date()))
          .sort((a, b) => parseISO(a.visit_date).getTime() - parseISO(b.visit_date).getTime())
          .slice(0, 5),
      [data.visits]
    );

    return (
      <Container fluid>
        {error && (
          <Alert variant="danger" onClose={() => setError("")} dismissible>
            {error}
          </Alert>
        )}
        <Row>
          <Col xs="12" sm="6" lg="3" className="mb-4">
            <Card className="card-stats">
              <Card.Body>
                <Row>
                  <Col xs="5" className="d-flex justify-content-center">
                    <div className="icon-big text-center icon-warning">
                      <i className="fa fa-calendar-alt text-primary" aria-hidden="true" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Recent Visits</p>
                      <Card.Title as="h4">{loading ? "..." : recentVisits}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1" aria-hidden="true" /> Updated now
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
                      <i className="fa fa-clock text-warning" aria-hidden="true" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Upcoming Appointments</p>
                      <Card.Title as="h4">{loading ? "..." : upcomingAppointments}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="far fa-calendar-alt mr-1" aria-hidden="true" /> This week
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
                      <i className="fa fa-bell text-danger" aria-hidden="true" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Unread Notifications</p>
                      <Card.Title as="h4">{loading ? "..." : unreadNotifications}</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-redo mr-1" aria-hidden="true" /> Updated now
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
                      <i className="fa fa-user text-success" aria-hidden="true" />
                    </div>
                  </Col>
                  <Col xs="7">
                    <div className="numbers">
                      <p className="card-category">Profile Completion</p>
                      <Card.Title as="h4">{profileCompletion}%</Card.Title>
                    </div>
                  </Col>
                </Row>
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-check mr-1" aria-hidden="true" /> Updated
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col xs="12" className="mb-4">
            <Card>
              <Card.Header>
                <Card.Title as="h4">Upcoming Visits</Card.Title>
                <p className="card-category">Your next 5 scheduled visits</p>
              </Card.Header>
              <Card.Body>
                {loading ? (
                  <div className="text-center">
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
                ) : upcomingVisits.length === 0 ? (
                  <p className="text-center">No upcoming visits found.</p>
                ) : (
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Doctor Name</th>
                        <th>Location</th>
                        <th>Visit Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingVisits.map((visit) => (
                        <tr key={visit.id}>
                          <td>{visit.doctor_name}</td>
                          <td>{visit.location}</td>
                          <td>{format(parseISO(visit.visit_date), "MM/dd/yyyy HH:mm")}</td>
                          <td>{visit.notes || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card.Body>
              <Card.Footer>
                <hr />
                <div className="stats">
                  <i className="fas fa-history" aria-hidden="true" /> Updated just now
                </div>
              </Card.Footer>
            </Card>
          </Col>
        </Row>
        <ReportList user={user} token={token} role={user.role} onEdit={handleEditReport} />
      </Container>
    );
  };

  return (
    <>
      {showReportForm && (
        <ReportForm
          report={selectedReport}
          onSave={handleSaveReport}
          onCancel={() => setShowReportForm(false)}
        />
      )}
      {user.role === "admin" || user.role === "marketer" ? <AdminMarketerDashboard /> : <UserDashboard />}
    </>
  );
}

export default Dashboard;