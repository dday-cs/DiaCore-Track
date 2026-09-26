document.addEventListener("DOMContentLoaded", function () {
  var profileImage = document.getElementById('profileImage');
  var defaultAvatar = document.getElementById('defaultAvatar');
  var photoInput = document.getElementById('photoInput');
  var photoOverlay = document.getElementById('photoOverlay');
  var displayName = document.getElementById('displayName');
  var displayEmail = document.getElementById('displayEmail');
  var detailName = document.getElementById('detailName');
  var detailEmail = document.getElementById('detailEmail');
  var detailAge = document.getElementById('detailAge');
  var detailDiabetes = document.getElementById('detailDiabetes');
  var detailMemberSince = document.getElementById('detailMemberSince');
  var glucoseCount = document.getElementById('glucoseCount');
  var medicationCount = document.getElementById('medicationCount');
  var reminderCount = document.getElementById('reminderCount');
  var streakCount = document.getElementById('streakCount');

  var editModal = document.getElementById('editModal');
  var editBtn = document.getElementById('editProfileBtn');
  var modalClose = document.getElementById('modalClose');
  var modalCancel = document.getElementById('modalCancel');
  var modalSave = document.getElementById('modalSave');
  var editName = document.getElementById('editName');
  var editEmail = document.getElementById('editEmail');
  var editAge = document.getElementById('editAge');
  var editDiabetes = document.getElementById('editDiabetes');

  var profileForNav = JSON.parse(localStorage.getItem('userProfile') || 'null') || {};
  var initials = (profileForNav.name || 'U').split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) { return part[0]; }).join('').toUpperCase();
  document.getElementById('userInitials').textContent = initials;
  document.getElementById('topInitials').textContent = initials;
  document.getElementById('sidebarName').textContent = profileForNav.name || 'Your account';
  document.getElementById('currentDate').textContent = new Date().toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });

  function loadProfile() {
    var profile = JSON.parse(localStorage.getItem('userProfile') || "null");
    var email = localStorage.getItem('userEmail');

    if (profile) {
      displayName.textContent = profile.name || 'User Name';
      detailName.textContent = profile.name || 'User Name';
      if (detailAge) detailAge.textContent = profile.age || 'Not added';
      detailDiabetes.textContent = profile.diabetesType || 'Type 1 Diabetes';
      editName.value = profile.name || '';
      editAge.value = profile.age || '';
      editDiabetes.value = profile.diabetesType || '';
    }

    if (email) {
      displayEmail.textContent = email;
      detailEmail.textContent = email;
      editEmail.value = email;
    }

    var savedPhoto = localStorage.getItem('profilePhoto');
    if (savedPhoto) {
      profileImage.src = savedPhoto;
      profileImage.style.display = 'block';
      defaultAvatar.style.display = 'none';
    } else {
      profileImage.style.display = 'none';
      defaultAvatar.style.display = 'flex';
    }

    var memberDate = localStorage.getItem('memberSince');
    if (memberDate) {
      detailMemberSince.textContent = memberDate;
    } else {
      var now = new Date();
      var memberSince = now.toLocaleString('default', { month: 'long' }) + ' ' + now.getFullYear();
      detailMemberSince.textContent = memberSince;
      localStorage.setItem('memberSince', memberSince);
    }

    loadStats();
  }

  function loadStats() {
    var glucoseLogs = JSON.parse(localStorage.getItem('glucoseLogs') || "[]");
    glucoseCount.textContent = glucoseLogs.length;
    var medications = JSON.parse(localStorage.getItem('medications') || "[]");
    var activeMedications = medications.filter(function (med) { return med.status !== 'archived' && med.status !== 'inactive'; });
    medicationCount.textContent = activeMedications.length;
    reminderCount.textContent = activeMedications.reduce(function (total, med) { return total + (Array.isArray(med.times) && med.times.length ? med.times.length : (med.time ? 1 : 0)); }, 0);

    if (glucoseLogs.length > 0) {
      var firstLog = new Date(glucoseLogs[0].date);
      var now = new Date();
      var diffDays = Math.ceil(Math.abs(now - firstLog) / (1000 * 60 * 60 * 24));
      streakCount.textContent = diffDays;
    } else {
      streakCount.textContent = '0';
    }
  }

  photoOverlay.addEventListener('click', function () { photoInput.click(); });
  photoInput.addEventListener('change', function (e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function (event) {
        var imageUrl = event.target.result;
        profileImage.src = imageUrl;
        profileImage.style.display = 'block';
        defaultAvatar.style.display = 'none';
        localStorage.setItem('profilePhoto', imageUrl);
      };
      reader.readAsDataURL(file);
    }
  });

  editBtn.addEventListener('click', function () { editModal.classList.add('active'); });
  function closeModal() { editModal.classList.remove('active'); }
  modalClose.addEventListener('click', closeModal);
  modalCancel.addEventListener('click', closeModal);
  editModal.addEventListener('click', function (e) { if (e.target === editModal) closeModal(); });

  modalSave.addEventListener('click', function () {
    var name = editName.value.trim();
    var email = editEmail.value.trim();
    var age = editAge.value.trim();
    var diabetes = editDiabetes.value.trim();

    if (!name) { alert('Please enter your name.'); editName.focus(); return; }
    if (!email || email.indexOf('@') === -1 || email.indexOf('.') === -1) { alert('Please enter a valid email address.'); editEmail.focus(); return; }

    var profile = JSON.parse(localStorage.getItem('userProfile') || "{}");
    profile.name = name;
    profile.email = email;
    profile.age = age || profile.age;
    profile.diabetesType = diabetes || profile.diabetesType;
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('userEmail', email);

    displayName.textContent = name;
    displayEmail.textContent = email;
    detailName.textContent = name;
    detailEmail.textContent = email;
    if (detailAge) detailAge.textContent = age || 'Not added';
    detailDiabetes.textContent = diabetes || 'Type 1 Diabetes';

    closeModal();
  });

  document.getElementById('logoutBtn').addEventListener('click', function () {
    if (confirm('Are you sure you want to logout?')) {
      window.location.href = 'login.html';
    }
  });

  loadProfile();
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && editModal.classList.contains('active')) closeModal();
  });
});
