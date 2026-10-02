/**
 * AURA GRAND - Modern Hotel Management System
 * Frontend Application Engine
 */

class HotelApp {
  constructor() {
    this.apiBase = '/api';
    this.rooms = [];
    this.guests = [];
    this.bookings = [];
    this.stats = {};
    this.systemStatus = {};
    this.activeTab = 'dashboard';

    this.init();
  }

  async init() {
    this.bindEvents();
    this.setupDatePickers();
    await this.refreshAllData();
    
    // Poll system health every 30s
    setInterval(() => this.checkSystemStatus(false), 30000);
  }

  bindEvents() {
    // Tab Navigation
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        const tab = item.getAttribute('data-tab');
        if (tab) this.switchTab(tab);
      });
    });

    // Mobile Sidebar Toggle
    const mobileToggle = document.getElementById('mobileToggle');
    const sidebar = document.getElementById('sidebar');
    if (mobileToggle && sidebar) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
      });
    }

    // Refresh button
    const btnRefresh = document.getElementById('btnRefresh');
    if (btnRefresh) {
      btnRefresh.addEventListener('click', () => {
        this.showToast('Refreshing data from PostgreSQL...', 'info');
        this.refreshAllData();
      });
    }

    // Quick New Booking Button
    const btnNewBooking = document.getElementById('btnNewBooking');
    if (btnNewBooking) {
      btnNewBooking.addEventListener('click', () => {
        this.openBookingModal();
      });
    }

    // Search and Filter Listeners
    const roomSearch = document.getElementById('roomSearchInput');
    const roomAvail = document.getElementById('roomAvailabilityFilter');
    const roomType = document.getElementById('roomTypeFilter');
    if (roomSearch) roomSearch.addEventListener('input', () => this.renderRooms());
    if (roomAvail) roomAvail.addEventListener('change', () => this.renderRooms());
    if (roomType) roomType.addEventListener('change', () => this.renderRooms());

    const guestSearch = document.getElementById('guestSearchInput');
    if (guestSearch) guestSearch.addEventListener('input', () => this.renderGuests());

    const bookingSearch = document.getElementById('bookingSearchInput');
    if (bookingSearch) bookingSearch.addEventListener('input', () => this.renderBookings());
  }

  setupDatePickers() {
    const today = new Date().toISOString().split('T')[0];
    const checkIn = document.getElementById('bookingCheckIn');
    const checkOut = document.getElementById('bookingCheckOut');
    
    if (checkIn && checkOut) {
      checkIn.min = today;
      checkIn.value = today;
      
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      checkOut.min = tomorrow.toISOString().split('T')[0];
      checkOut.value = tomorrow.toISOString().split('T')[0];
    }
  }

  switchTab(tabId) {
    this.activeTab = tabId;
    
    // Update nav items
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
      if (item.getAttribute('data-tab') === tabId) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Update panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.classList.remove('active');
    });

    const targetPane = document.getElementById(`tab-${tabId}`);
    if (targetPane) targetPane.classList.add('active');

    // Update Title
    const titles = {
      dashboard: 'Dashboard Overview',
      rooms: 'Rooms Management',
      guests: 'Guest Directory',
      bookings: 'Bookings & Stays',
      database: 'PostgreSQL Inspector'
    };
    const pageTitleEl = document.getElementById('pageTitle');
    if (pageTitleEl) pageTitleEl.textContent = titles[tabId] || 'Hotel Management';

    // Close mobile menu if open
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('open');
  }

  async refreshAllData() {
    try {
      await Promise.all([
        this.fetchRooms(),
        this.fetchGuests(),
        this.fetchBookings(),
        this.fetchStats(),
        this.checkSystemStatus(false)
      ]);
    } catch (err) {
      console.error('Error refreshing data:', err);
    }
  }

  // ==========================================
  // API FETCH METHODS
  // ==========================================

  async fetchRooms() {
    try {
      const res = await fetch(`${this.apiBase}/rooms`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      this.rooms = await res.json();
      this.renderRooms();
      this.populateRoomTypeFilter();
      this.populateBookingSelects();
    } catch (err) {
      console.error('Failed to fetch rooms:', err);
      this.showToast('Could not load rooms. Check PostgreSQL connection.', 'error');
    }
  }

  async fetchGuests() {
    try {
      const res = await fetch(`${this.apiBase}/guests`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      this.guests = await res.json();
      this.renderGuests();
      this.populateBookingSelects();
    } catch (err) {
      console.error('Failed to fetch guests:', err);
    }
  }

  async fetchBookings() {
    try {
      const res = await fetch(`${this.apiBase}/bookings`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      this.bookings = await res.json();
      this.renderBookings();
      this.renderDashboardRecentBookings();
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }

  async fetchStats() {
    try {
      const res = await fetch(`${this.apiBase}/system/stats`);
      if (res.ok) {
        this.stats = await res.json();
        this.renderStats();
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }

  async checkSystemStatus(showNotification = false) {
    const dot = document.getElementById('dbDot');
    const statusText = document.getElementById('dbStatusText');
    const portLabel = document.getElementById('dbPortLabel');
    const detailsContainer = document.getElementById('dbStatusDetails');

    try {
      const res = await fetch(`${this.apiBase}/system/status`);
      const data = await res.json();
      this.systemStatus = data;

      if (data.databaseConnected) {
        if (dot) dot.style.background = 'var(--accent-emerald)';
        if (statusText) statusText.textContent = data.databaseProduct || 'PostgreSQL';
        if (portLabel) portLabel.textContent = '5432 (Connected)';

        if (detailsContainer) {
          detailsContainer.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Database Product:</span>
                <strong style="color: #fff;">${data.databaseProduct}</strong>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Server Version:</span>
                <span style="color: #a5b4fc;">${data.databaseVersion}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Driver Name:</span>
                <span style="color: #6ee7b7;">${data.driverName}</span>
              </div>
              <div style="display: flex; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.06); padding-bottom: 8px;">
                <span style="color: var(--text-muted);">Driver Version:</span>
                <span style="color: #fde047;">${data.driverVersion}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding-top: 4px;">
                <span style="color: var(--text-muted);">Connection URL:</span>
                <span style="color: var(--text-main); font-family: monospace; font-size: 0.78rem;">${data.databaseUrl}</span>
              </div>
            </div>
          `;
        }

        if (showNotification) this.showToast('PostgreSQL database connected successfully!', 'success');
      } else {
        if (dot) dot.style.background = 'var(--accent-rose)';
        if (statusText) statusText.textContent = 'Disconnected';
        if (portLabel) portLabel.textContent = 'Offline';

        if (detailsContainer) {
          detailsContainer.innerHTML = `
            <div style="padding: 14px; background: rgba(244, 63, 94, 0.1); border: 1px solid var(--accent-rose); border-radius: 8px; color: #fecdd3; font-size: 0.85rem;">
              <strong>Connection Error:</strong> ${data.error || 'Cannot establish JDBC connection'}
            </div>
          `;
        }
        if (showNotification) this.showToast('Database connection failed. Verify PostgreSQL server is running.', 'error');
      }
    } catch (err) {
      if (dot) dot.style.background = 'var(--accent-rose)';
      if (statusText) statusText.textContent = 'Error';
      if (showNotification) this.showToast('Cannot connect to backend server.', 'error');
    }
  }

  // ==========================================
  // RENDER METHODS
  // ==========================================

  renderStats() {
    const statTotalRooms = document.getElementById('statTotalRooms');
    const statRoomsSub = document.getElementById('statRoomsSub');
    const statAvailableRooms = document.getElementById('statAvailableRooms');
    const statOccupancy = document.getElementById('statOccupancy');
    const statTotalGuests = document.getElementById('statTotalGuests');
    const statTotalRevenue = document.getElementById('statTotalRevenue');
    const statBookingsCount = document.getElementById('statBookingsCount');

    if (statTotalRooms) statTotalRooms.textContent = this.stats.totalRooms ?? this.rooms.length;
    if (statRoomsSub) statRoomsSub.textContent = `${this.stats.bookedRooms ?? 0} booked / occupied`;
    if (statAvailableRooms) statAvailableRooms.textContent = this.stats.availableRooms ?? 0;
    if (statOccupancy) statOccupancy.textContent = `${this.stats.occupancyRate ?? 0}% Occupancy`;
    if (statTotalGuests) statTotalGuests.textContent = this.stats.totalGuests ?? this.guests.length;
    if (statTotalRevenue) statTotalRevenue.textContent = `$${Number(this.stats.totalRevenue ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    if (statBookingsCount) statBookingsCount.textContent = `From ${this.stats.totalBookings ?? this.bookings.length} reservations`;
  }

  renderDashboardRecentBookings() {
    const tbody = document.getElementById('dashboardRecentBookingsTable');
    if (!tbody) return;

    if (this.bookings.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 24px;">No reservations found</td></tr>`;
      return;
    }

    const recent = [...this.bookings].reverse().slice(0, 5);
    tbody.innerHTML = recent.map(b => `
      <tr>
        <td><strong style="color: var(--primary);">#${b.id}</strong></td>
        <td>${b.guest ? b.guest.fullName : 'Guest #' + b.guest?.id}</td>
        <td><span class="badge badge-room-type">Room ${b.room ? b.room.roomNumber : b.room?.id}</span></td>
        <td style="font-size: 0.84rem; color: var(--text-muted);">${b.checkInDate} → ${b.checkOutDate}</td>
        <td><strong style="color: var(--accent-emerald);">$${Number(b.totalAmount).toFixed(2)}</strong></td>
      </tr>
    `).join('');
  }

  renderRooms() {
    const container = document.getElementById('roomsGridContainer');
    if (!container) return;

    const query = (document.getElementById('roomSearchInput')?.value || '').toLowerCase();
    const availFilter = document.getElementById('roomAvailabilityFilter')?.value || 'all';
    const typeFilter = document.getElementById('roomTypeFilter')?.value || 'all';

    const filtered = this.rooms.filter(room => {
      const matchesSearch = room.roomNumber.toLowerCase().includes(query) || room.type.toLowerCase().includes(query);
      const matchesAvail = availFilter === 'all' || (availFilter === 'available' ? room.available : !room.available);
      const matchesType = typeFilter === 'all' || room.type === typeFilter;
      return matchesSearch && matchesAvail && matchesType;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px 20px; color: var(--text-dim);">
          <i class="fa-solid fa-bed" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.4;"></i>
          <p>No rooms match your filters</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(r => `
      <div class="glass-card room-card">
        <div>
          <div class="room-card-header">
            <span class="room-number-tag">Room ${r.roomNumber}</span>
            <span class="badge ${r.available ? 'badge-available' : 'badge-booked'}">
              <i class="fa-solid ${r.available ? 'fa-check' : 'fa-lock'}"></i>
              ${r.available ? 'Available' : 'Booked'}
            </span>
          </div>
          <div class="room-type-text">${r.type}</div>
          <div class="room-price-box">
            <span class="room-price-val">$${Number(r.pricePerNight).toFixed(2)}</span>
            <span class="room-price-unit">/ night</span>
          </div>
        </div>

        <div class="room-card-footer">
          <button class="btn-ghost" style="padding: 6px 12px; font-size: 0.8rem;" onclick="app.openBookingForRoom(${r.id})">
            <i class="fa-solid fa-calendar-plus" style="color: var(--primary);"></i> Book
          </button>
          <div class="table-actions">
            <button class="btn-icon edit" title="Edit Room" onclick="app.openEditRoomModal(${r.id})">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn-icon delete" title="Delete Room" onclick="app.deleteRoom(${r.id})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  populateRoomTypeFilter() {
    const select = document.getElementById('roomTypeFilter');
    if (!select) return;

    const types = [...new Set(this.rooms.map(r => r.type))];
    const currentValue = select.value;

    select.innerHTML = '<option value="all">All Room Types</option>' + 
      types.map(t => `<option value="${t}">${t}</option>`).join('');

    if (types.includes(currentValue)) select.value = currentValue;
  }

  renderGuests() {
    const tbody = document.getElementById('guestsTableBody');
    if (!tbody) return;

    const query = (document.getElementById('guestSearchInput')?.value || '').toLowerCase();
    const filtered = this.guests.filter(g => 
      g.fullName.toLowerCase().includes(query) || 
      g.email.toLowerCase().includes(query) || 
      g.phoneNumber.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--text-dim); padding: 32px;">No guests found</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(g => `
      <tr>
        <td><strong style="color: var(--text-dim);">#${g.id}</strong></td>
        <td>
          <div style="font-weight: 600; color: #fff;">${g.fullName}</div>
        </td>
        <td>
          <span style="color: #cbd5e1;"><i class="fa-regular fa-envelope" style="margin-right: 6px; color: var(--text-dim);"></i>${g.email}</span>
        </td>
        <td>
          <span style="color: #cbd5e1;"><i class="fa-solid fa-phone" style="margin-right: 6px; color: var(--text-dim);"></i>${g.phoneNumber}</span>
        </td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button class="btn-icon edit" title="Edit Guest" onclick="app.openEditGuestModal(${g.id})">
              <i class="fa-solid fa-user-pen"></i>
            </button>
            <button class="btn-icon delete" title="Delete Guest" onclick="app.deleteGuest(${g.id})">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  renderBookings() {
    const tbody = document.getElementById('bookingsTableBody');
    if (!tbody) return;

    const query = (document.getElementById('bookingSearchInput')?.value || '').toLowerCase();
    const filtered = this.bookings.filter(b => {
      const guestName = (b.guest?.fullName || '').toLowerCase();
      const roomNum = (b.room?.roomNumber || '').toLowerCase();
      const bookingId = String(b.id);
      return guestName.includes(query) || roomNum.includes(query) || bookingId.includes(query);
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--text-dim); padding: 32px;">No reservations found</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(b => {
      const nights = this.calculateNights(b.checkInDate, b.checkOutDate);
      return `
        <tr>
          <td><strong style="color: var(--primary);">#${b.id}</strong></td>
          <td>
            <div style="font-weight: 600; color: #fff;">${b.guest ? b.guest.fullName : 'Guest #' + b.guest?.id}</div>
            <div style="font-size: 0.76rem; color: var(--text-dim);">${b.guest ? b.guest.email : ''}</div>
          </td>
          <td>
            <span class="badge badge-room-type">Room ${b.room ? b.room.roomNumber : b.room?.id}</span>
            <div style="font-size: 0.76rem; color: var(--text-dim);">${b.room ? b.room.type : ''}</div>
          </td>
          <td style="font-size: 0.86rem; color: #cbd5e1;">${b.checkInDate}</td>
          <td style="font-size: 0.86rem; color: #cbd5e1;">${b.checkOutDate}</td>
          <td><span style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 600;">${nights} night${nights > 1 ? 's' : ''}</span></td>
          <td><strong style="color: var(--accent-emerald); font-size: 0.95rem;">$${Number(b.totalAmount).toFixed(2)}</strong></td>
          <td style="text-align: right;">
            <div class="table-actions" style="justify-content: flex-end;">
              <button class="btn-icon view" title="View & Print Invoice" onclick="app.showInvoice(${b.id})">
                <i class="fa-solid fa-receipt"></i>
              </button>
              <button class="btn-icon edit" title="Edit Booking" onclick="app.openEditBookingModal(${b.id})">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn-icon delete" title="Cancel Booking" onclick="app.deleteBooking(${b.id})">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  populateBookingSelects() {
    const roomSelect = document.getElementById('bookingRoomSelect');
    const guestSelect = document.getElementById('bookingGuestSelect');

    if (roomSelect) {
      const currentVal = roomSelect.value;
      roomSelect.innerHTML = '<option value="">-- Choose Room --</option>' +
        this.rooms.map(r => `
          <option value="${r.id}" data-price="${r.pricePerNight}">
            Room ${r.roomNumber} - ${r.type} ($${r.pricePerNight}/night) ${r.available ? '' : '(Currently Booked)'}
          </option>
        `).join('');
      if (currentVal) roomSelect.value = currentVal;
    }

    if (guestSelect) {
      const currentGuest = guestSelect.value;
      guestSelect.innerHTML = '<option value="">-- Choose Guest --</option>' +
        this.guests.map(g => `
          <option value="${g.id}">
            ${g.fullName} (${g.email})
          </option>
        `).join('');
      if (currentGuest) guestSelect.value = currentGuest;
    }
  }

  // ==========================================
  // MODAL HANDLERS & CALCULATIONS
  // ==========================================

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('show');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove('show');
  }

  openEditRoomModal(id) {
    const room = this.rooms.find(r => r.id === id);
    if (!room) return;

    document.getElementById('roomId').value = room.id;
    document.getElementById('roomNumber').value = room.roomNumber;
    document.getElementById('roomType').value = room.type;
    document.getElementById('roomPrice').value = room.pricePerNight;
    document.getElementById('roomAvailable').value = String(room.available);
    document.getElementById('roomModalTitle').textContent = `Edit Room #${room.roomNumber}`;
    this.openModal('roomModal');
  }

  openEditGuestModal(id) {
    const guest = this.guests.find(g => g.id === id);
    if (!guest) return;

    document.getElementById('guestId').value = guest.id;
    document.getElementById('guestFullName').value = guest.fullName;
    document.getElementById('guestEmail').value = guest.email;
    document.getElementById('guestPhone').value = guest.phoneNumber;
    document.getElementById('guestModalTitle').textContent = `Edit Guest: ${guest.fullName}`;
    this.openModal('guestModal');
  }

  openBookingModal() {
    document.getElementById('bookingId').value = '';
    document.getElementById('bookingModalTitle').textContent = 'Create New Reservation';
    this.populateBookingSelects();
    this.setupDatePickers();
    this.calculateBookingTotal();
    this.openModal('bookingModal');
  }

  openBookingForRoom(roomId) {
    this.openBookingModal();
    const roomSelect = document.getElementById('bookingRoomSelect');
    if (roomSelect) {
      roomSelect.value = roomId;
      this.calculateBookingTotal();
    }
  }

  openEditBookingModal(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return;

    this.populateBookingSelects();
    document.getElementById('bookingId').value = booking.id;
    document.getElementById('bookingRoomSelect').value = booking.room ? booking.room.id : '';
    document.getElementById('bookingGuestSelect').value = booking.guest ? booking.guest.id : '';
    document.getElementById('bookingCheckIn').value = booking.checkInDate;
    document.getElementById('bookingCheckOut').value = booking.checkOutDate;
    document.getElementById('bookingModalTitle').textContent = `Edit Reservation #${booking.id}`;
    this.calculateBookingTotal();
    this.openModal('bookingModal');
  }

  calculateNights(inDateStr, outDateStr) {
    if (!inDateStr || !outDateStr) return 1;
    const d1 = new Date(inDateStr);
    const d2 = new Date(outDateStr);
    const diffTime = d2.getTime() - d1.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }

  calculateBookingTotal() {
    const roomSelect = document.getElementById('bookingRoomSelect');
    const checkIn = document.getElementById('bookingCheckIn')?.value;
    const checkOut = document.getElementById('bookingCheckOut')?.value;

    const daysEl = document.getElementById('bookingCalcDays');
    const rateEl = document.getElementById('bookingCalcRate');
    const totalEl = document.getElementById('bookingCalcTotal');
    const totalHidden = document.getElementById('bookingTotalAmount');

    let pricePerNight = 0;
    if (roomSelect && roomSelect.selectedIndex > 0) {
      const opt = roomSelect.options[roomSelect.selectedIndex];
      pricePerNight = parseFloat(opt.getAttribute('data-price')) || 0;
    }

    const nights = this.calculateNights(checkIn, checkOut);
    const total = nights * pricePerNight;

    if (daysEl) daysEl.textContent = `${nights} night${nights > 1 ? 's' : ''}`;
    if (rateEl) rateEl.textContent = `$${pricePerNight.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
    if (totalHidden) totalHidden.value = total;
  }

  showInvoice(id) {
    const booking = this.bookings.find(b => b.id === id);
    if (!booking) return;

    const nights = this.calculateNights(booking.checkInDate, booking.checkOutDate);
    const roomPrice = booking.room ? booking.room.pricePerNight : (booking.totalAmount / nights);
    const invoiceEl = document.getElementById('invoiceContent');

    if (invoiceEl) {
      invoiceEl.innerHTML = `
        <div style="background: rgba(15, 23, 42, 0.6); padding: 18px; border-radius: 12px; border: 1px solid var(--glass-border); margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
            <span style="color: var(--text-muted);">Invoice Number:</span>
            <strong style="color: #fff;">INV-${1000 + booking.id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
            <span style="color: var(--text-muted);">Guest Name:</span>
            <strong style="color: #fff;">${booking.guest ? booking.guest.fullName : 'Guest #' + booking.guest?.id}</strong>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 8px;">
            <span style="color: var(--text-muted);">Guest Email:</span>
            <span style="color: #cbd5e1;">${booking.guest ? booking.guest.email : ''}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem;">
            <span style="color: var(--text-muted);">Phone:</span>
            <span style="color: #cbd5e1;">${booking.guest ? booking.guest.phoneNumber : ''}</span>
          </div>
        </div>

        <div class="invoice-box">
          <div class="invoice-row">
            <span>Room Reserved:</span>
            <strong style="color: #fff;">Room #${booking.room ? booking.room.roomNumber : ''} (${booking.room ? booking.room.type : ''})</strong>
          </div>
          <div class="invoice-row">
            <span>Check-in Date:</span>
            <span>${booking.checkInDate}</span>
          </div>
          <div class="invoice-row">
            <span>Check-out Date:</span>
            <span>${booking.checkOutDate}</span>
          </div>
          <div class="invoice-row">
            <span>Stay Length:</span>
            <span>${nights} night${nights > 1 ? 's' : ''} @ $${Number(roomPrice).toFixed(2)}/night</span>
          </div>
          <div class="invoice-row">
            <span>Subtotal:</span>
            <span>$${Number(booking.totalAmount).toFixed(2)}</span>
          </div>
          <div class="invoice-row">
            <span>Taxes & Service Fees (0% Promo):</span>
            <span>$0.00</span>
          </div>
          <div class="invoice-total">
            <span>Total Paid / Due:</span>
            <span style="color: var(--accent-emerald);">$${Number(booking.totalAmount).toFixed(2)}</span>
          </div>
        </div>
      `;
    }

    this.openModal('invoiceModal');
  }

  // ==========================================
  // FORM SUBMISSIONS
  // ==========================================

  async handleRoomSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('roomId').value;
    const roomData = {
      roomNumber: document.getElementById('roomNumber').value.trim(),
      type: document.getElementById('roomType').value.trim(),
      pricePerNight: parseFloat(document.getElementById('roomPrice').value),
      available: document.getElementById('roomAvailable').value === 'true'
    };

    try {
      const url = id ? `${this.apiBase}/rooms/${id}` : `${this.apiBase}/rooms`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save room');
      }

      this.closeModal('roomModal');
      this.showToast(id ? 'Room updated successfully!' : 'Room created successfully!', 'success');
      await this.fetchRooms();
      await this.fetchStats();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async handleGuestSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('guestId').value;
    const guestData = {
      fullName: document.getElementById('guestFullName').value.trim(),
      email: document.getElementById('guestEmail').value.trim(),
      phoneNumber: document.getElementById('guestPhone').value.trim()
    };

    try {
      const url = id ? `${this.apiBase}/guests/${id}` : `${this.apiBase}/guests`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guestData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save guest');
      }

      this.closeModal('guestModal');
      this.showToast(id ? 'Guest updated successfully!' : 'Guest registered successfully!', 'success');
      await this.fetchGuests();
      await this.fetchStats();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async handleBookingSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('bookingId').value;
    const roomId = parseInt(document.getElementById('bookingRoomSelect').value);
    const guestId = parseInt(document.getElementById('bookingGuestSelect').value);
    const checkInDate = document.getElementById('bookingCheckIn').value;
    const checkOutDate = document.getElementById('bookingCheckOut').value;
    const totalAmount = parseFloat(document.getElementById('bookingTotalAmount').value) || 0;

    if (!roomId || !guestId) {
      this.showToast('Please select both a room and a guest', 'error');
      return;
    }

    const bookingData = {
      room: { id: roomId },
      guest: { id: guestId },
      checkInDate,
      checkOutDate,
      totalAmount
    };

    try {
      const url = id ? `${this.apiBase}/bookings/${id}` : `${this.apiBase}/bookings`;
      const method = id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save reservation');
      }

      this.closeModal('bookingModal');
      this.showToast(id ? 'Reservation updated successfully!' : 'Reservation created successfully!', 'success');
      await this.refreshAllData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async deleteRoom(id) {
    if (!confirm('Are you sure you want to delete this room? This cannot be undone.')) return;
    try {
      const res = await fetch(`${this.apiBase}/rooms/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Cannot delete room with active bookings.');
      this.showToast('Room deleted successfully', 'success');
      await this.fetchRooms();
      await this.fetchStats();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async deleteGuest(id) {
    if (!confirm('Are you sure you want to remove this guest profile?')) return;
    try {
      const res = await fetch(`${this.apiBase}/guests/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Cannot delete guest with active reservations.');
      this.showToast('Guest removed successfully', 'success');
      await this.fetchGuests();
      await this.fetchStats();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  async deleteBooking(id) {
    if (!confirm('Are you sure you want to cancel and delete this reservation?')) return;
    try {
      const res = await fetch(`${this.apiBase}/bookings/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to cancel reservation.');
      this.showToast('Reservation cancelled successfully', 'success');
      await this.refreshAllData();
    } catch (err) {
      this.showToast(err.message, 'error');
    }
  }

  // ==========================================
  // TOAST NOTIFICATIONS
  // ==========================================

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const icons = {
      success: 'fa-circle-check',
      error: 'fa-circle-exclamation',
      info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i class="fa-solid ${icons[type] || 'fa-info'} toast-icon"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 4000);
  }
}

// Global App Instance
const app = new HotelApp();
