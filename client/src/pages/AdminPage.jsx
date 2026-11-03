import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import {
  getAllUsers, deleteUser, updateUser,
  getAllWorkoutPlans, getWorkoutPlanById, deleteWorkoutPlan,
  getAllMealPlans, getMealPlanById, deleteMealPlan,
  getUsersWithStats, getUserCheckIns,
  createUserFull,
} from '../services/adminService';
import { getAllUsersConversations, getUserConversation } from '../services/supportService';
import supportSocket from '../services/supportSocket';
import './AdminPage.css';

const TABS = [
  { key: 'users',    label: 'Users' },
  { key: 'workouts', label: 'Workout Plans' },
  { key: 'meals',    label: 'Meal Plans' },
  { key: 'checkins', label: 'Check-Ins' },
  { key: 'chat',     label: 'Chat Center' },
];

const DAY_ORDER  = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_ORDER = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function AdminPage() {
  const user      = JSON.parse(localStorage.getItem('user') || '{}');
  const userRole  = user?.userRole;
  const canAccess = userRole === 'admin' || userRole === 'manager';
  const isAdmin   = userRole === 'admin';

  // ── Tab data ──────────────────────────────────────────────────────────────
  const [activeTab,    setActiveTab]    = useState('users');
  const [users,        setUsers]        = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [mealPlans,    setMealPlans]    = useState([]);
  const [checkInUsers, setCheckInUsers] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // ── User inline edit ──────────────────────────────────────────────────────
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm,      setEditForm]      = useState({ firstName: '', lastName: '', userRole: '' });
  const [savingEdit,    setSavingEdit]    = useState(false);

  // ── Add-user form ─────────────────────────────────────────────────────────
  const [showAddUser,    setShowAddUser]    = useState(false);
  const [addUserForm,    setAddUserForm]    = useState({
    firstName: '', lastName: '', email: '', password: '',
    age: '', gender: '', height: '', weight: '',
    fitnessGoal: '', activityLevel: '', workoutsPerWeek: '', mealsPerDay: '',
  });
  const [addUserErrors,   setAddUserErrors]   = useState({});
  const [addUserApiError, setAddUserApiError] = useState('');
  const [addUserSaving,   setAddUserSaving]   = useState(false);

  // ── Detail modals ─────────────────────────────────────────────────────────
  // null = closed; { loading, plan, error } = open
  const [planModal,     setPlanModal]     = useState(null);
  const [mealModal,     setMealModal]     = useState(null);
  // null = closed; { loading, user, checkIns, error } = open
  const [checkInsModal, setCheckInsModal] = useState(null);

  // ── Chat Center ────────────────────────────────────────────────────────────
  const [chatConvList,      setChatConvList]      = useState([]);  // all user conversations for sidebar
  const [selectedChatUid,   setSelectedChatUid]   = useState(null);
  const [chatMessages,      setChatMessages]       = useState([]);
  const [chatInput,         setChatInput]          = useState('');
  const [chatLoading,       setChatLoading]        = useState(false);
  const [chatConnected,     setChatConnected]      = useState(false);
  const [chatOtherTyping,   setChatOtherTyping]    = useState(false);
  const chatBottomRef      = useRef(null);
  const chatTypingTimer    = useRef(null);
  const selectedChatUidRef = useRef(null);

  // ── Admin stats strip ─────────────────────────────────────────────────────
  const [adminStats, setAdminStats] = useState(null);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchActiveTab = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'users') {
        setUsers((await getAllUsers()) || []);
      } else if (activeTab === 'workouts') {
        setWorkoutPlans((await getAllWorkoutPlans()) || []);
      } else if (activeTab === 'meals') {
        setMealPlans((await getAllMealPlans()) || []);
      } else if (activeTab === 'checkins') {
        setCheckInUsers((await getUsersWithStats()) || []);
      } else if (activeTab === 'chat') {
        setChatConvList((await getAllUsersConversations()) || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data. Make sure the backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    if (!canAccess) return;
    setEditingUserId(null);
    fetchActiveTab();
  }, [fetchActiveTab, canAccess]);

  // Populate admin stats strip (one-time on mount)
  useEffect(() => {
    if (!canAccess) return;
    let cancelled = false;
    Promise.allSettled([
      getAllUsers(),
      getAllWorkoutPlans(),
      getAllMealPlans(),
      getUsersWithStats(),
    ]).then(([u, w, m, c]) => {
      if (cancelled) return;
      setAdminStats({
        users:    u.status === 'fulfilled' ? (u.value || []).length : '—',
        workouts: w.status === 'fulfilled' ? (w.value || []).length : '—',
        meals:    m.status === 'fulfilled' ? (m.value || []).length : '—',
        checkIns: c.status === 'fulfilled'
          ? (c.value || []).reduce((s, u) => s + (u.checkInCount || 0), 0)
          : '—',
      });
    });
    return () => { cancelled = true; };
  }, [canAccess]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Chat Center socket lifecycle ──────────────────────────────────────────
  useEffect(() => {
    if (activeTab !== 'chat' || !canAccess) return;

    supportSocket.connect();
    supportSocket.emit('support:join', { userId: user.userId, role: userRole });

    const onConnect    = () => setChatConnected(true);
    const onDisconnect = () => setChatConnected(false);

    const onNewMessage = ({ conversationUserId, message }) => {
      // Update sidebar last-message preview
      setChatConvList(prev => prev.map(c =>
        c.userId === conversationUserId
          ? { ...c, lastMessage: message, updatedAt: message.createdAt }
          : c
      ));
      // If this conversation is currently open, append message
      if (Number(conversationUserId) === Number(selectedChatUidRef.current)) {
        setChatMessages(prev => [...prev, message]);
      }
    };

    const onTyping = ({ conversationUserId, senderId, isTyping: typing }) => {
      if (
        Number(conversationUserId) === Number(selectedChatUid) &&
        Number(senderId) !== Number(user.userId)
      ) {
        setChatOtherTyping(typing);
      }
    };

    const onPresence = ({ userId: uid, isOnline }) => {
      setChatConvList(prev => prev.map(c =>
        c.userId === uid ? { ...c, isOnline } : c
      ));
    };

    supportSocket.on('connect',                 onConnect);
    supportSocket.on('disconnect',              onDisconnect);
    supportSocket.on('support:new_message',     onNewMessage);
    supportSocket.on('support:typing',          onTyping);
    supportSocket.on('support:presence_update', onPresence);

    return () => {
      supportSocket.off('connect',                 onConnect);
      supportSocket.off('disconnect',              onDisconnect);
      supportSocket.off('support:new_message',     onNewMessage);
      supportSocket.off('support:typing',          onTyping);
      supportSocket.off('support:presence_update', onPresence);
      supportSocket.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, canAccess]);

  // Auto-scroll chat when messages change
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, chatOtherTyping]);

  if (!canAccess) return <Navigate to="/dashboard" replace />;

  const switchTab = (key) => {
    if (key === activeTab) return;
    setEditingUserId(null);
    // Disconnect support socket when leaving chat tab
    if (activeTab === 'chat') {
      supportSocket.disconnect();
      setChatConnected(false);
    }
    setActiveTab(key);
  };

  // ── Users ──────────────────────────────────────────────────────────────────
  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Delete user "${u.firstName} ${u.lastName}" (ID ${u.userid})? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteUser(u.userid);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to delete user.');
    }
  };

  const startEdit = (u) => {
    setEditingUserId(u.userid);
    setEditForm({ firstName: u.firstName || '', lastName: u.lastName || '', userRole: u.userRole || 'user' });
  };
  const cancelEdit = () => setEditingUserId(null);
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };
  const saveEdit = async (original) => {
    setSavingEdit(true);
    setError('');
    try {
      await updateUser(original.userid, {
        ...original,
        firstName: editForm.firstName,
        lastName:  editForm.lastName,
        userRole:  editForm.userRole,
      });
      setEditingUserId(null);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to update user.');
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Add user ───────────────────────────────────────────────────────────────
  const validateAddUser = () => {
    const f = addUserForm;
    const errs = {};
    if (!f.firstName.trim()) {
      errs.firstName = 'First name is required';
    } else if (!/^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/.test(f.firstName.trim())) {
      errs.firstName = 'Name may only contain letters, spaces, hyphens, and apostrophes';
    }
    if (!f.lastName.trim()) {
      errs.lastName = 'Last name is required';
    } else if (!/^[a-zA-Zא-ת '\-]*[a-zA-Zא-ת][a-zA-Zא-ת '\-]*$/.test(f.lastName.trim())) {
      errs.lastName = 'Name may only contain letters, spaces, hyphens, and apostrophes';
    }
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email))
      errs.email = 'Valid email is required';
    if (!f.password || f.password.length < 6)
      errs.password = 'Password must be at least 6 characters';
    const age = Number(f.age);
    if (!f.age || isNaN(age) || age < 13 || age > 120)
      errs.age = 'Age must be between 13 and 120';
    if (!f.gender) errs.gender = 'Gender is required';
    const height = Number(f.height);
    if (!f.height || isNaN(height) || height < 100 || height > 250)
      errs.height = 'Height must be between 100 and 250 cm';
    const weight = Number(f.weight);
    if (!f.weight || isNaN(weight) || weight < 30 || weight > 300)
      errs.weight = 'Weight must be between 30 and 300 kg';
    if (!f.fitnessGoal)   errs.fitnessGoal   = 'Fitness goal is required';
    if (!f.activityLevel) errs.activityLevel = 'Activity level is required';
    const wpw = Number(f.workoutsPerWeek);
    if (!f.workoutsPerWeek || !Number.isInteger(wpw) || wpw < 1 || wpw > 7)
      errs.workoutsPerWeek = 'Must be a whole number between 1 and 7';
    const mpd = Number(f.mealsPerDay);
    if (!f.mealsPerDay || !Number.isInteger(mpd) || mpd < 1 || mpd > 8)
      errs.mealsPerDay = 'Must be a whole number between 1 and 8';
    return errs;
  };

  const handleAddUserSubmit = async () => {
    const errs = validateAddUser();
    setAddUserErrors(errs);
    setAddUserApiError('');
    if (Object.keys(errs).length > 0) return;
    setAddUserSaving(true);
    try {
      await createUserFull({
        ...addUserForm,
        age:             Number(addUserForm.age),
        height:          Number(addUserForm.height),
        weight:          Number(addUserForm.weight),
        workoutsPerWeek: Number(addUserForm.workoutsPerWeek),
        mealsPerDay:     Number(addUserForm.mealsPerDay),
      });
      setAddUserForm({
        firstName: '', lastName: '', email: '', password: '',
        age: '', gender: '', height: '', weight: '',
        fitnessGoal: '', activityLevel: '', workoutsPerWeek: '', mealsPerDay: '',
      });
      setAddUserErrors({});
      setShowAddUser(false);
      fetchActiveTab();
    } catch (err) {
      setAddUserApiError(err.message || 'Failed to create user.');
    } finally {
      setAddUserSaving(false);
    }
  };

  const handleAddUserChange = (e) => {
    const { name, value } = e.target;
    setAddUserForm(prev => ({ ...prev, [name]: value }));
  };

  // ── Plan deletes ────────────────────────────────────────────────────────────
  const handleDeleteWorkoutPlan = async (p) => {
    if (!window.confirm(`Delete workout plan "${p.name}" (ID ${p.workoutPlanId})? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteWorkoutPlan(p.workoutPlanId);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to delete workout plan.');
    }
  };

  const handleDeleteMealPlan = async (p) => {
    if (!window.confirm(`Delete meal plan "${p.name}" (ID ${p.dailyMealPlanId})? This cannot be undone.`)) return;
    setError('');
    try {
      await deleteMealPlan(p.dailyMealPlanId);
      fetchActiveTab();
    } catch (err) {
      setError(err.message || 'Failed to delete meal plan.');
    }
  };

  // ── Detail modal handlers ──────────────────────────────────────────────────
  const handleViewWorkoutPlan = async (planId) => {
    setPlanModal({ loading: true, plan: null, error: '' });
    try {
      const plan = await getWorkoutPlanById(planId);
      setPlanModal({ loading: false, plan, error: '' });
    } catch (err) {
      setPlanModal({ loading: false, plan: null, error: err.message || 'Failed to load plan details.' });
    }
  };

  const handleViewMealPlan = async (planId) => {
    setMealModal({ loading: true, plan: null, error: '' });
    try {
      const plan = await getMealPlanById(planId);
      setMealModal({ loading: false, plan, error: '' });
    } catch (err) {
      setMealModal({ loading: false, plan: null, error: err.message || 'Failed to load meal plan details.' });
    }
  };

  const handleViewUserCheckIns = async (u) => {
    setCheckInsModal({ loading: true, user: u, checkIns: [], error: '' });
    try {
      const checkIns = await getUserCheckIns(u.userId);
      setCheckInsModal({ loading: false, user: u, checkIns: checkIns || [], error: '' });
    } catch (err) {
      setCheckInsModal({ loading: false, user: u, checkIns: [], error: err.message || 'Failed to load check-ins.' });
    }
  };

  // ── Chat Center handlers ───────────────────────────────────────────────────
  const openUserChat = async (convUserId) => {
    setSelectedChatUid(convUserId);
    selectedChatUidRef.current = convUserId;
    setChatLoading(true);
    setChatMessages([]);
    try {
      const conv = await getUserConversation(convUserId);
      setChatMessages(conv?.messages ?? []);
    } catch {
      setChatMessages([]);
    } finally {
      setChatLoading(false);
    }
  };

  const sendChatMessage = () => {
    const text = chatInput.trim();
    if (!text || !selectedChatUid) return;
    supportSocket.emit('support:message', { conversationUserId: selectedChatUid, message: text });
    setChatInput('');
    supportSocket.emit('support:typing', { conversationUserId: selectedChatUid, isTyping: false });
  };

  const handleChatKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendChatMessage();
      return;
    }
    supportSocket.emit('support:typing', { conversationUserId: selectedChatUid, isTyping: true });
    clearTimeout(chatTypingTimer.current);
    chatTypingTimer.current = setTimeout(() => {
      supportSocket.emit('support:typing', { conversationUserId: selectedChatUid, isTyping: false });
    }, 1500);
  };

  const formatChatTime = (ts) => ts
    ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '';

  // ── Tab renderers ──────────────────────────────────────────────────────────
  const renderUsers = () => (
    <>
      {!showAddUser && (
        <button
          className="action-btn save"
          style={{ marginBottom: '1.25rem' }}
          onClick={() => { setShowAddUser(true); setAddUserApiError(''); }}
        >
          + Add User
        </button>
      )}

      {showAddUser && (
        <div className="add-user-form">
          <h3 className="add-user-title">New User</h3>
          <div className="add-user-grid">
            <div className="form-group">
              <label>First Name</label>
              <input name="firstName" value={addUserForm.firstName}
                onChange={handleAddUserChange}
                className={addUserErrors.firstName ? 'input-error' : ''} />
              {addUserErrors.firstName && <span className="error-msg">{addUserErrors.firstName}</span>}
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input name="lastName" value={addUserForm.lastName}
                onChange={handleAddUserChange}
                className={addUserErrors.lastName ? 'input-error' : ''} />
              {addUserErrors.lastName && <span className="error-msg">{addUserErrors.lastName}</span>}
            </div>
            <div className="form-group form-group--full">
              <label>Email</label>
              <input name="email" type="email" value={addUserForm.email}
                onChange={handleAddUserChange}
                className={addUserErrors.email ? 'input-error' : ''} />
              {addUserErrors.email && <span className="error-msg">{addUserErrors.email}</span>}
            </div>
            <div className="form-group form-group--full">
              <label>Password</label>
              <input name="password" type="password" value={addUserForm.password}
                onChange={handleAddUserChange}
                className={addUserErrors.password ? 'input-error' : ''} />
              {addUserErrors.password && <span className="error-msg">{addUserErrors.password}</span>}
            </div>
            <div className="form-group">
              <label>Age</label>
              <input name="age" type="number" value={addUserForm.age}
                onChange={handleAddUserChange}
                className={addUserErrors.age ? 'input-error' : ''} />
              {addUserErrors.age && <span className="error-msg">{addUserErrors.age}</span>}
            </div>
            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={addUserForm.gender} onChange={handleAddUserChange}
                className={addUserErrors.gender ? 'input-error' : ''}>
                <option value="">Select…</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
              {addUserErrors.gender && <span className="error-msg">{addUserErrors.gender}</span>}
            </div>
            <div className="form-group">
              <label>Height (cm)</label>
              <input name="height" type="number" value={addUserForm.height}
                onChange={handleAddUserChange}
                className={addUserErrors.height ? 'input-error' : ''} />
              {addUserErrors.height && <span className="error-msg">{addUserErrors.height}</span>}
            </div>
            <div className="form-group">
              <label>Weight (kg)</label>
              <input name="weight" type="number" value={addUserForm.weight}
                onChange={handleAddUserChange}
                className={addUserErrors.weight ? 'input-error' : ''} />
              {addUserErrors.weight && <span className="error-msg">{addUserErrors.weight}</span>}
            </div>
            <div className="form-group">
              <label>Fitness Goal</label>
              <select name="fitnessGoal" value={addUserForm.fitnessGoal} onChange={handleAddUserChange}
                className={addUserErrors.fitnessGoal ? 'input-error' : ''}>
                <option value="">Select…</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="maintenance">Maintenance</option>
              </select>
              {addUserErrors.fitnessGoal && <span className="error-msg">{addUserErrors.fitnessGoal}</span>}
            </div>
            <div className="form-group">
              <label>Activity Level</label>
              <select name="activityLevel" value={addUserForm.activityLevel} onChange={handleAddUserChange}
                className={addUserErrors.activityLevel ? 'input-error' : ''}>
                <option value="">Select…</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
              {addUserErrors.activityLevel && <span className="error-msg">{addUserErrors.activityLevel}</span>}
            </div>
            <div className="form-group">
              <label>Workouts / Week</label>
              <input name="workoutsPerWeek" type="number" value={addUserForm.workoutsPerWeek}
                onChange={handleAddUserChange}
                className={addUserErrors.workoutsPerWeek ? 'input-error' : ''} />
              {addUserErrors.workoutsPerWeek && <span className="error-msg">{addUserErrors.workoutsPerWeek}</span>}
            </div>
            <div className="form-group">
              <label>Meals / Day</label>
              <input name="mealsPerDay" type="number" value={addUserForm.mealsPerDay}
                onChange={handleAddUserChange}
                className={addUserErrors.mealsPerDay ? 'input-error' : ''} />
              {addUserErrors.mealsPerDay && <span className="error-msg">{addUserErrors.mealsPerDay}</span>}
            </div>
          </div>
          {addUserApiError && <div className="api-error">{addUserApiError}</div>}
          <div className="add-user-actions">
            <button className="action-btn save" disabled={addUserSaving} onClick={handleAddUserSubmit}>
              {addUserSaving ? 'Creating…' : 'Create User'}
            </button>
            <button className="action-btn cancel" disabled={addUserSaving}
              onClick={() => { setShowAddUser(false); setAddUserErrors({}); setAddUserApiError(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Role</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <React.Fragment key={u.userid}>
                <tr>
                  <td>{u.userid}</td>
                  <td>{u.firstName}</td>
                  <td>{u.lastName}</td>
                  <td>
                    <span className={`badge ${u.userRole === 'admin' ? 'badge-danger' : u.userRole === 'manager' ? 'badge-warning' : 'badge-neutral'}`}>
                      {u.userRole}
                    </span>
                  </td>
                  <td>{u.createDate ? String(u.createDate).split('T')[0] : '—'}</td>
                  <td>
                    <button className="action-btn edit" onClick={() => startEdit(u)}>Edit</button>
                    {isAdmin && (
                      <button className="action-btn delete" onClick={() => handleDeleteUser(u)}>Delete</button>
                    )}
                  </td>
                </tr>
                {editingUserId === u.userid && (
                  <tr>
                    <td colSpan={6}>
                      <div className="inline-edit-form">
                        <input name="firstName" value={editForm.firstName}
                          onChange={handleEditChange} placeholder="First name" aria-label="First name" />
                        <input name="lastName" value={editForm.lastName}
                          onChange={handleEditChange} placeholder="Last name" aria-label="Last name" />
                        <select name="userRole" value={editForm.userRole}
                          onChange={handleEditChange} aria-label="Role">
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                          <option value="manager">manager</option>
                        </select>
                        <button className="action-btn save" disabled={savingEdit} onClick={() => saveEdit(u)}>
                          {savingEdit ? 'Saving…' : 'Save'}
                        </button>
                        <button className="action-btn cancel" disabled={savingEdit} onClick={cancelEdit}>
                          Cancel
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const renderWorkoutPlans = () => (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Goal</th>
            <th>User ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {workoutPlans.map(p => (
            <tr key={p.workoutPlanId}>
              <td>{p.workoutPlanId}</td>
              <td>{p.name}</td>
              <td>{p.goal}</td>
              <td>{p.userId}</td>
              <td>
                <button className="action-btn edit" onClick={() => handleViewWorkoutPlan(p.workoutPlanId)}>
                  View
                </button>
                {isAdmin && (
                  <button className="action-btn delete" onClick={() => handleDeleteWorkoutPlan(p)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMealPlans = () => (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Goal</th>
            <th>Target Calories</th>
            <th>User ID</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {mealPlans.map(p => (
            <tr key={p.dailyMealPlanId}>
              <td>{p.dailyMealPlanId}</td>
              <td>{p.name}</td>
              <td>{p.goal}</td>
              <td>{p.targetCalories}</td>
              <td>{p.userId}</td>
              <td>
                <button className="action-btn edit" onClick={() => handleViewMealPlan(p.dailyMealPlanId)}>
                  View
                </button>
                {isAdmin && (
                  <button className="action-btn delete" onClick={() => handleDeleteMealPlan(p)}>
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderCheckIns = () => (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Current Weight (kg)</th>
            <th>Check-Ins</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {checkInUsers.map(u => (
            <tr key={u.userId}>
              <td>{u.userId}</td>
              <td>{u.firstName} {u.lastName}</td>
              <td>
                <span className={`badge ${u.userRole === 'admin' ? 'badge-danger' : u.userRole === 'manager' ? 'badge-warning' : 'badge-neutral'}`}>
                  {u.userRole}
                </span>
              </td>
              <td>{u.currentWeight != null ? u.currentWeight : '—'}</td>
              <td>{u.checkInCount}</td>
              <td>
                <button className="action-btn edit" onClick={() => handleViewUserCheckIns(u)}>
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  // ── Modal renderers ────────────────────────────────────────────────────────
  const renderPlanModal = () => {
    const { loading: pLoading, plan, error: pError } = planModal;
    return (
      <div className="ap-modal-backdrop" onClick={() => setPlanModal(null)}>
        <div className="ap-modal-card" onClick={e => e.stopPropagation()}>
          <button className="ap-modal-close" onClick={() => setPlanModal(null)} aria-label="Close">✕</button>
          {pLoading && <p className="loading">Loading plan details…</p>}
          {pError   && <div className="error-banner">{pError}</div>}
          {plan && (
            <>
              <h2 className="ap-modal-title">{plan.name}</h2>
              <div className="ap-modal-meta">
                <span>Goal: {plan.goal}</span>
                <span>User ID: {plan.userId}</span>
                <span>{plan.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              {plan.days.length === 0 ? (
                <p className="ap-empty">No workout days found.</p>
              ) : (
                [...plan.days]
                  .sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day))
                  .map(day => (
                    <div key={day.workoutDayId} className="ap-plan-day">
                      <h3 className="ap-section-title">
                        {day.day}{day.title ? ` — ${day.title}` : ''}
                      </h3>
                      {day.exercises.length === 0 ? (
                        <p className="ap-empty">No exercises.</p>
                      ) : (
                        <div className="table-wrapper">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Exercise</th>
                                <th>Sets</th>
                                <th>Reps</th>
                                <th>Target Weight (kg)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {day.exercises.map(ex => (
                                <tr key={ex.id}>
                                  <td>{ex.exerciseName}</td>
                                  <td>{ex.targetSets  ?? '—'}</td>
                                  <td>{ex.targetReps  ?? '—'}</td>
                                  <td>{ex.targetWeight ?? '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderMealModal = () => {
    const { loading: mLoading, plan, error: mError } = mealModal;
    return (
      <div className="ap-modal-backdrop" onClick={() => setMealModal(null)}>
        <div className="ap-modal-card" onClick={e => e.stopPropagation()}>
          <button className="ap-modal-close" onClick={() => setMealModal(null)} aria-label="Close">✕</button>
          {mLoading && <p className="loading">Loading meal plan details…</p>}
          {mError   && <div className="error-banner">{mError}</div>}
          {plan && (
            <>
              <h2 className="ap-modal-title">{plan.name}</h2>
              <div className="ap-modal-meta">
                <span>Goal: {plan.goal}</span>
                <span>Target: {plan.targetCalories} kcal / {plan.targetProtein}g protein</span>
                <span>User ID: {plan.userId}</span>
                <span>{plan.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              {plan.meals.length === 0 ? (
                <p className="ap-empty">No meals found.</p>
              ) : (
                [...plan.meals]
                  .sort((a, b) => MEAL_ORDER.indexOf(a.mealType) - MEAL_ORDER.indexOf(b.mealType))
                  .map(meal => (
                    <div key={meal.mealId} className="ap-meal-section">
                      <h3 className="ap-section-title">{meal.mealType} — {meal.title}</h3>
                      <p className="ap-meal-meta">
                        {meal.estimatedCalories} kcal · {meal.estimatedProtein}g protein
                      </p>
                      {meal.foodItems.length === 0 ? (
                        <p className="ap-empty">No food items.</p>
                      ) : (
                        <div className="table-wrapper">
                          <table className="data-table">
                            <thead>
                              <tr>
                                <th>Food Item</th>
                                <th>Quantity (g)</th>
                              </tr>
                            </thead>
                            <tbody>
                              {meal.foodItems.map(fi => (
                                <tr key={fi.id}>
                                  <td>{fi.foodName}</td>
                                  <td>{fi.quantityGrams}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const renderCheckInsModal = () => {
    const { loading: cLoading, user: u, checkIns, error: cError } = checkInsModal;
    return (
      <div className="ap-modal-backdrop" onClick={() => setCheckInsModal(null)}>
        <div className="ap-modal-card" onClick={e => e.stopPropagation()}>
          <button className="ap-modal-close" onClick={() => setCheckInsModal(null)} aria-label="Close">✕</button>
          <h2 className="ap-modal-title">{u.firstName} {u.lastName} — Check-In History</h2>
          <p className="ap-modal-subtitle">User ID: {u.userId} · Role: {u.userRole}</p>
          {cLoading && <p className="loading">Loading check-ins…</p>}
          {cError   && <div className="error-banner">{cError}</div>}
          {!cLoading && !cError && (
            checkIns.length === 0 ? (
              <p className="ap-empty">No check-ins recorded yet.</p>
            ) : (
              <div className="table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Weight (kg)</th>
                      <th>Workouts</th>
                      <th>Feedback</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...checkIns]
                      .sort((a, b) => new Date(b.checkInDate) - new Date(a.checkInDate))
                      .map(ci => (
                        <tr key={ci.checkInId}>
                          <td>{ci.checkInDate}</td>
                          <td>{ci.weight}</td>
                          <td>{ci.workoutsCompleted}</td>
                          <td>{ci.feedback || '—'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    );
  };

  const renderChatCenter = () => (
    <div className="cc-layout">
      {/* Left sidebar — conversation list */}
      <div className="cc-sidebar">
        <div className="cc-sidebar-header">
          <span>Users</span>
          {!chatConnected && <span className="cc-offline-pill">Connecting…</span>}
        </div>
        {chatConvList.length === 0 && (
          <p className="cc-empty-list">No conversations yet.</p>
        )}
        {chatConvList.map(c => (
          <div
            key={c.userId}
            className={`cc-conv-item${selectedChatUid === c.userId ? ' active' : ''}`}
            onClick={() => openUserChat(c.userId)}
          >
            <div className="cc-conv-top">
              <span className="cc-conv-name">
                <span className={`cc-presence-dot ${c.isOnline ? 'online' : 'offline'}`} />
                {c.userName}
              </span>
              <span className="cc-conv-time">
                {c.lastMessage ? formatChatTime(c.lastMessage.createdAt) : ''}
              </span>
            </div>
            <div className="cc-conv-preview">
              {c.lastMessage ? c.lastMessage.message : 'No messages yet'}
            </div>
          </div>
        ))}
      </div>

      {/* Right panel — open conversation */}
      <div className="cc-chat-panel">
        {!selectedChatUid ? (
          <div className="cc-no-selection">Select a user conversation to start chatting</div>
        ) : (
          <>
            {/* Chat header */}
            <div className="cc-chat-header">
              {chatConvList.find(c => c.userId === selectedChatUid)?.userName ?? `User #${selectedChatUid}`}
              <span className={`cc-presence-dot ${chatConvList.find(c => c.userId === selectedChatUid)?.isOnline ? 'online' : 'offline'}`} style={{ marginLeft: 8 }} />
            </div>

            {/* Messages */}
            <div className="cc-messages">
              {chatLoading && <p className="loading">Loading…</p>}
              {!chatLoading && chatMessages.length === 0 && (
                <p className="cc-empty-list">No messages yet.</p>
              )}
              {chatMessages.map(msg => {
                const isOwn = Number(msg.senderId) === Number(user.userId);
                return (
                  <div key={msg.id} className={`cc-bubble-row ${isOwn ? 'own' : 'other'}`}>
                    {!isOwn && (
                      <div className="cc-sender-name">{msg.senderName || 'User'}</div>
                    )}
                    <div className={`cc-bubble ${isOwn ? 'own' : 'other'}`}>{msg.message}</div>
                    <div className="cc-time">{formatChatTime(msg.createdAt)}</div>
                  </div>
                );
              })}
              {chatOtherTyping && (
                <div className="cc-bubble-row other">
                  <div className="cc-bubble other cc-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* Input */}
            <div className="cc-input-area">
              <textarea
                className="cc-input"
                placeholder="Type a reply…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={handleChatKeyDown}
                rows={1}
              />
              <button
                className="cc-send-btn"
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  const isChatTab = activeTab === 'chat';

  const tabHasData =
    (activeTab === 'users'    && users.length        > 0) ||
    (activeTab === 'workouts' && workoutPlans.length > 0) ||
    (activeTab === 'meals'    && mealPlans.length    > 0) ||
    (activeTab === 'checkins' && checkInUsers.length > 0) ||
    (activeTab === 'chat'     && chatConvList.length >= 0); // chat center always "has data"

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage users, workout plans, and meal plans</p>
      </div>

      {adminStats && (
        <div className="admin-stats-strip">
          <div className="admin-stat-pill">
            <span className="admin-stat-value">{adminStats.users}</span>
            <span className="admin-stat-label">Users</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-value">{adminStats.workouts}</span>
            <span className="admin-stat-label">Workout Plans</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-value">{adminStats.meals}</span>
            <span className="admin-stat-label">Meal Plans</span>
          </div>
          <div className="admin-stat-pill">
            <span className="admin-stat-value">{adminStats.checkIns}</span>
            <span className="admin-stat-label">Total Check-ins</span>
          </div>
        </div>
      )}

      <div className="admin-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
            onClick={() => switchTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className={`admin-table-section${isChatTab ? ' no-padding' : ''}`}>
        {!isChatTab && loading && <p className="loading">Loading…</p>}
        {!isChatTab && error   && <div className="error-banner">{error}</div>}

        {!isChatTab && !loading && !error && !tabHasData && (
          <p className="table-empty">No data to display.</p>
        )}

        {(!isChatTab && !loading && !error && tabHasData) && (
          <>
            {activeTab === 'users'    && renderUsers()}
            {activeTab === 'workouts' && renderWorkoutPlans()}
            {activeTab === 'meals'    && renderMealPlans()}
            {activeTab === 'checkins' && renderCheckIns()}
          </>
        )}

        {isChatTab && renderChatCenter()}
      </div>

      {planModal     && renderPlanModal()}
      {mealModal     && renderMealModal()}
      {checkInsModal && renderCheckInsModal()}
    </div>
  );
}

export default AdminPage;
