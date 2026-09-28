// VelaiConnect – வேலைConnect  |  Full English + Tamil UI dictionary
export type Lang = 'en' | 'ta';

type Entry = { en: string; ta: string };

export const translations: Record<string, Entry> = {
  // ---- Brand ----
  'brand.en': { en: 'VelaiConnect', ta: 'VelaiConnect' },
  'brand.ta': { en: 'வேலைConnect', ta: 'வேலைConnect' },
  'tagline': { en: 'Find Jobs • Find Workers', ta: 'வேலை தேடுங்கள் • தொழிலாளர்களைத் தேடுங்கள்' },

  // ---- Language switcher ----
  'lang.switch': { en: 'English | தமிழ்', ta: 'English | தமிழ்' },

  // ---- Tabs ----
  'tabs.home': { en: 'Home', ta: 'முகப்பு' },
  'tabs.jobs': { en: 'Jobs', ta: 'வேலைகள்' },
  'tabs.saved': { en: 'Saved', ta: 'சேமிப்பு' },
  'tabs.applications': { en: 'Applications', ta: 'விண்ணப்பங்கள்' },
  'tabs.profile': { en: 'Profile', ta: 'சுயவிவரம்' },
  'tabs.dashboard': { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  'tabs.postJob': { en: 'Post Job', ta: 'வேலை இடு' },
  'tabs.myJobs': { en: 'My Jobs', ta: 'என் வேலைகள்' },
  'tabs.applicants': { en: 'Applicants', ta: 'விண்ணப்பதாரர்' },
  'admin.useWeb': { en: 'Admins use the web dashboard', ta: 'நிர்வாகிகள் வெப் டாஷ்போர்டை பயன்படுத்துகிறார்கள்' },

  // ---- Login ----
  'login.enterMobile': { en: 'Enter Mobile Number', ta: 'கைபேசி எண்ணை உள்ளிடுங்கள்' },
  'login.sendOtp': { en: 'SEND OTP', ta: 'OTP அனுப்பு' },
  'login.newTo': { en: 'New to VelaiConnect?', ta: 'VelaiConnect-க்கு புதியவரா?' },
  'login.registerNow': { en: 'REGISTER NOW', ta: 'இப்போது பதிவு செய்யுங்கள்' },
  'login.welcomeBack': { en: 'Welcome back!', ta: 'மீண்டும் வருக!' },

  // ---- OTP ----
  'otp.title': { en: 'Verify OTP', ta: 'OTP சரிபார்க்கவும்' },
  'otp.sentTo': { en: 'Code sent to', ta: 'அனுப்பப்பட்ட எண்' },
  'otp.verify': { en: 'VERIFY OTP', ta: 'OTP சரிபார்க்கவும்' },
  'otp.resend': { en: 'Resend OTP', ta: 'OTP மீண்டும் அனுப்பு' },
  'otp.resendIn': { en: 'Resend in', ta: 'மீண்டும் அனுப்ப' },
  'otp.seconds': { en: 's', ta: 'வி' },
  'otp.devHint': { en: 'Dev mode OTP:', ta: 'டெவ் OTP:' },

  // ---- Registration ----
  'reg.chooseType': { en: 'How do you want to use VelaiConnect?', ta: 'VelaiConnect-ஐ எப்படி பயன்படுத்த விரும்புகிறீர்கள்?' },
  'reg.jobSeeker': { en: 'JOB SEEKER', ta: 'வேலை தேடுபவர்' },
  'reg.jobSeekerDesc': { en: 'Find jobs and apply', ta: 'வேலைகளைத் தேடி விண்ணப்பிக்கவும்' },
  'reg.employer': { en: 'EMPLOYER', ta: 'முதலாளி' },
  'reg.employerDesc': { en: 'Post jobs and hire', ta: 'வேலைகளை இட்டு பணியமர்த்துங்கள்' },
  'reg.continue': { en: 'CONTINUE', ta: 'தொடர்க' },
  'reg.step': { en: 'Step', ta: 'படி' },
  'reg.of': { en: 'of', ta: '/' },

  // ---- Common fields ----
  'field.fullName': { en: 'Full Name', ta: 'முழு பெயர்' },
  'field.mobile': { en: 'Mobile Number', ta: 'கைபேசி எண்' },
  'field.location': { en: 'Location', ta: 'இடம்' },
  'field.city': { en: 'City', ta: 'நகரம்' },
  'field.education': { en: 'Education', ta: 'கல்வி' },
  'field.skills': { en: 'Skills (comma separated)', ta: 'திறமைகள் (கமாவால் பிரிக்கவும்)' },
  'field.experience': { en: 'Experience (years)', ta: 'அனுபவம் (ஆண்டுகள்)' },
  'field.preferredCategory': { en: 'Preferred Job Category', ta: 'விருப்ப வேலை வகை' },
  'field.expectedSalary': { en: 'Expected Salary', ta: 'எதிர்பார்க்கும் சம்பளம்' },
  'field.min': { en: 'Min', ta: 'குறைந்தபட்சம்' },
  'field.max': { en: 'Max', ta: 'அதிகபட்சம்' },
  'field.jobType': { en: 'Job Type', ta: 'வேலை வகை' },
  'field.resume': { en: 'Resume (optional)', ta: 'ரெசியூம் (விருப்பம்)' },
  'field.profilePhoto': { en: 'Profile Photo (optional)', ta: 'சுயவிவர படம் (விருப்பம்)' },
  'field.companyName': { en: 'Company / Employer Name', ta: 'நிறுவனம் / முதலாளி பெயர்' },
  'field.companyType': { en: 'Company Type', ta: 'நிறுவன வகை' },
  'field.companyDesc': { en: 'Company Description', ta: 'நிறுவன விளக்கம்' },
  'field.contactPerson': { en: 'Contact Person', ta: 'தொடர்பு நபர்' },
  'field.companyLogo': { en: 'Company Logo (optional)', ta: 'நிறுவன லோகோ (விருப்பம்)' },
  'field.gst': { en: 'GST Number (optional)', ta: 'GST எண் (விருப்பம்)' },
  'field.regNumber': { en: 'Company Reg. No. (optional)', ta: 'நிறுவன பதிவு எண் (விருப்பம்)' },
  'field.optional': { en: 'optional', ta: 'விருப்பம்' },

  // ---- Buttons ----
  'btn.save': { en: 'SAVE', ta: 'சேமி' },
  'btn.submit': { en: 'SUBMIT', ta: 'சமர்ப்பி' },
  'btn.skip': { en: 'Skip for now', ta: 'இப்போது தவிர்' },
  'btn.applyNow': { en: 'APPLY NOW', ta: 'விண்ணப்பிக்கவும்' },
  'btn.applied': { en: 'APPLIED ✓', ta: 'விண்ணப்பித்தது ✓' },
  'btn.search': { en: 'Search', ta: 'தேடு' },
  'btn.filters': { en: 'Filters', ta: 'வடிகட்டி' },
  'btn.postJob': { en: 'Post Job', ta: 'வேலை இடு' },
  'btn.retry': { en: 'Retry', ta: 'மீண்டும் முயற்சி' },
  'btn.logout': { en: 'Logout', ta: 'வெளியேறு' },
  'btn.confirm': { en: 'CONFIRM', ta: 'உறுதிசெய்' },
  'btn.close': { en: 'Close', ta: 'மூடு' },
  'btn.delete': { en: 'Delete', ta: 'நீக்கு' },
  'btn.edit': { en: 'Edit', ta: 'திருத்து' },
  'btn.saveChanges': { en: 'SAVE CHANGES', ta: 'மாற்றங்களை சேமி' },
  'btn.uploadResume': { en: 'Upload Resume', ta: 'ரெசியூம் பதிவேற்று' },
  'btn.call': { en: 'Call', ta: 'அழை' },
  'btn.report': { en: '⚠️ Report Job', ta: '⚠️ புகார் அளி' },
  'btn.applyFilters': { en: 'Apply Filters', ta: 'வடிகட்டியை பயன்படுத்து' },
  'btn.clearFilters': { en: 'Clear', ta: 'அழி' },

  // ---- Seeker home ----
  'home.welcome': { en: 'Welcome,', ta: 'வணக்கம்,' },
  'home.searchJobs': { en: 'Search Jobs', ta: 'வேலைகளைத் தேடு' },
  'home.searchPlaceholder': { en: 'Job title, skill, company…', ta: 'வேலை பெயர், திறமை, நிறுவனம்…' },
  'home.recommended': { en: 'Recommended Jobs', ta: 'பரிந்துரைக்கப்பட்ட வேலைகள்' },
  'home.nearYou': { en: 'Jobs Near You', ta: 'உங்கள் அருகில் வேலைகள்' },
  'home.latest': { en: 'Latest Jobs', ta: 'சமீபத்திய வேலைகள்' },
  'home.quickJobs': { en: 'Quick Jobs', ta: 'உடனடி வேலைகள்' },
  'home.needJobToday': { en: 'Need a job today?', ta: 'இன்றே வேலை வேண்டுமா?' },
  'home.viewAll': { en: 'View all', ta: 'அனைத்தையும் பார்' },
  'home.location': { en: 'Location', ta: 'இடம்' },
  'home.useMyLocation': { en: '📍 Near me', ta: '📍 என் அருகில்' },

  // ---- Jobs list ----
  'jobs.title': { en: 'Jobs', ta: 'வேலைகள்' },
  'jobs.categories': { en: 'Categories', ta: 'வகைகள்' },
  'jobs.allCategories': { en: 'All Categories', ta: 'அனைத்து வகைகளும்' },
  'jobs.noResults': { en: 'No jobs found', ta: 'வேலைகள் இல்லை' },
  'jobs.noResultsDesc': { en: 'Try different keywords or filters', ta: 'வேறு சொற்கள் அல்லது வடிகட்டி முயற்சிக்கவும்' },
  'jobs.vacancies': { en: 'vacancies', ta: 'காலியிடங்கள்' },
  'jobs.posted': { en: 'Posted', ta: 'இடப்பட்டது' },
  'jobs.deadline': { en: 'Apply before', ta: 'விண்ணப்ப கடைசி தேதி' },

  // ---- Job details ----
  'detail.jobDetails': { en: 'Job Details', ta: 'வேலை விவரம்' },
  'detail.salary': { en: 'Salary', ta: 'சம்பளம்' },
  'detail.jobType': { en: 'Job Type', ta: 'வேலை வகை' },
  'detail.experience': { en: 'Experience', ta: 'அனுபவம்' },
  'detail.qualification': { en: 'Qualification', ta: 'தகுதி' },
  'detail.skills': { en: 'Required Skills', ta: 'தேவையான திறமைகள்' },
  'detail.vacancies': { en: 'Vacancies', ta: 'காலியிடங்கள்' },
  'detail.description': { en: 'Job Description', ta: 'வேலை விளக்கம்' },
  'detail.verifiedEmployer': { en: '🟢 Verified Employer', ta: '🟢 சரிபார்க்கப்பட்ட முதலாளி' },
  'detail.location': { en: 'Location', ta: 'இடம்' },
  'detail.applyConfirmTitle': { en: 'Apply for this job?', ta: 'இந்த வேலைக்கு விண்ணப்பிக்கவா?' },
  'detail.yourProfile': { en: 'Your profile will be shared with the employer', ta: 'உங்கள் சுயவிவரம் முதலாளிக்கு பகிரப்படும்' },

  // ---- Safety / money warning ----
  'safety.warning': { en: '⚠️ Never pay money to get a job!', ta: '⚠️ வேலை பெற பணம் கொடுக்க வேண்டாம்!' },
  'safety.warningDesc': {
    en: 'Real employers never ask for money. If anyone asks for money for a job, report them immediately.',
    ta: 'உண்மையான முதலாளிகள் பணம் கேட்க மாட்டார்கள். வேலைக்கு பணம் கேட்டால் உடனே புகார் அளிக்கவும்.',
  },
  'report.title': { en: 'Report this job', ta: 'இந்த வேலையை புகார் அளி' },
  'report.fake': { en: 'Fake job', ta: 'போலி வேலை' },
  'report.money': { en: 'Asking for money', ta: 'பணம் கேட்கிறார்கள்' },
  'report.wrong': { en: 'Wrong information', ta: 'தவறான தகவல்' },
  'report.scam': { en: 'Scam', ta: 'ஏமாத்தல்' },
  'report.other': { en: 'Other', ta: 'மற்றவை' },
  'report.submit': { en: 'Submit Report', ta: 'புகார் அனுப்பு' },
  'report.submitted': { en: 'Report submitted. Thank you!', ta: 'புகார் அனுப்பப்பட்டது. நன்றி!' },

  // ---- Applications ----
  'apps.title': { en: 'My Applications', ta: 'என் விண்ணப்பங்கள்' },
  'apps.submitted': { en: 'Application Submitted Successfully', ta: 'விண்ணப்பம் வெற்றிகரமாக சமர்ப்பிக்கப்பட்டது' },
  'apps.empty': { en: 'No applications yet', ta: 'இன்னும் விண்ணப்பம் இல்லை' },
  'apps.emptyDesc': { en: 'Apply to jobs and track them here', ta: 'வேலைகளுக்கு விண்ணப்பித்து இங்கே கண்காணியுங்கள்' },
  'status.APPLIED': { en: 'Applied', ta: 'விண்ணப்பித்தது' },
  'status.UNDER_REVIEW': { en: 'Under Review', ta: 'ஆய்வில் உள்ளது' },
  'status.SHORTLISTED': { en: 'Shortlisted', ta: 'பட்டியலிடப்பட்டது' },
  'status.REJECTED': { en: 'Rejected', ta: 'நிராகரிக்கப்பட்டது' },
  'status.SELECTED': { en: 'Selected 🎉', ta: 'தேர்வு செய்யப்பட்டது 🎉' },
  'status.WITHDRAWN': { en: 'Withdrawn', ta: 'விலக்கப்பட்டது' },
  'status.PENDING_APPROVAL': { en: 'Pending Approval', ta: 'அனுமதிக்காக காத்திருப்பு' },
  'status.ACTIVE': { en: 'Active', ta: 'செயலில்' },
  'status.CLOSED': { en: 'Closed', ta: 'மூடப்பட்டது' },
  'status.REMOVED': { en: 'Removed', ta: 'நீக்கப்பட்டது' },

  // ---- Saved ----
  'saved.title': { en: 'Saved Jobs', ta: 'சேமித்த வேலைகள்' },
  'saved.empty': { en: 'No saved jobs', ta: 'சேமித்த வேலைகள் இல்லை' },
  'saved.emptyDesc': { en: 'Tap ❤️ on any job to save it here', ta: 'எந்த வேலையிலும் ❤️ தட்டி இங்கே சேமிக்கவும்' },

  // ---- Profile ----
  'profile.title': { en: 'Profile', ta: 'சுயவிவரம்' },
  'profile.myProfile': { en: 'My Profile', ta: 'என் சுயவிவரம்' },
  'profile.editProfile': { en: 'Edit Profile', ta: 'சுயவிவரத்தை திருத்து' },
  'profile.notifications': { en: '🔔 Notifications', ta: '🔔 அறிவிப்புகள்' },
  'profile.jobAlerts': { en: '🔔 Job Alerts', ta: '🔔 வேலை அலர்ட்' },
  'profile.language': { en: '🌐 Language', ta: '🌐 மொழி' },
  'profile.verifyEmployer': { en: '✅ Verify Company', ta: '✅ நிறுவன சரிபார்ப்பு' },
  'profile.verified': { en: '🟢 Verified Employer', ta: '🟢 சரிபார்க்கப்பட்ட முதலாளி' },
  'profile.notVerified': { en: 'Not verified yet', ta: 'இன்னும் சரிபார்க்கப்படவில்லை' },
  'profile.updated': { en: 'Profile updated', ta: 'சுயவிவரம் புதுப்பிக்கப்பட்டது' },
  'verify.submitted': { en: 'Verification submitted for admin review', ta: 'சரிபார்ப்புக்காக சமர்ப்பிக்கப்பட்டது' },
  'verify.desc': {
    en: 'Submit your company details for the 🟢 Verified Employer badge. Our team reviews within 2-3 days.',
    ta: '🟢 சரிபார்க்கப்பட்ட முதலாளி பேட்ஜுக்கு உங்கள் நிறுவன விவரங்களை சமர்ப்பிக்கவும். 2-3 நாட்களில் மறுஆய்வு செய்யப்படும்.',
  },
  'alert.created': { en: 'Job alert created', ta: 'வேலை அலர்ட் உருவாக்கப்பட்டது' },

  // ---- Notifications ----
  'notif.title': { en: 'Notifications', ta: 'அறிவிப்புகள்' },
  'notif.empty': { en: 'No notifications', ta: 'அறிவிப்புகள் இல்லை' },

  // ---- Job alerts ----
  'alert.title': { en: 'Job Alerts', ta: 'வேலை அலர்ட்' },
  'alert.create': { en: 'Create Job Alert', ta: 'வேலை அலர்ட் உருவாக்கு' },
  'alert.empty': { en: 'No alerts yet. Create one to get notified about matching jobs.', ta: 'அலர்ட் இல்லை. பொருந்திய வேலைகள் வரும்போது தெரியப்படுத்த ஒன்றை உருவாக்குங்கள்.' },
  'alert.delete': { en: 'Delete alert', ta: 'அலர்ட் நீக்கு' },
  'alert.minSalary': { en: 'Minimum salary', ta: 'குறைந்தபட்ச சம்பளம்' },

  // ---- Employer dashboard ----
  'emp.dashboard': { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  'emp.myJobs': { en: 'My Jobs', ta: 'என் வேலைகள்' },
  'emp.applicants': { en: 'Applicants', ta: 'விண்ணப்பதாரர்கள்' },
  'emp.totalJobs': { en: 'Total Jobs', ta: 'மொத்த வேலைகள்' },
  'emp.activeJobs': { en: 'Active Jobs', ta: 'செயலில் உள்ள வேலைகள்' },
  'emp.totalApplicants': { en: 'Total Applicants', ta: 'மொத்த விண்ணப்பதாரர்கள்' },
  'emp.pendingJobs': { en: 'Pending Approval', ta: 'அனுமதிக்காக காத்திருப்பு' },
  'emp.noJobs': { en: 'No jobs posted yet', ta: 'இன்னும் வேலை இடப்படவில்லை' },
  'emp.noJobsDesc': { en: 'Post your first job to find workers', ta: 'தொழிலாளர்களை கண்டறிய முதல் வேலையை இடுங்கள்' },
  'emp.closedJob': { en: 'Job closed', ta: 'வேலை மூடப்பட்டது' },
  'emp.deletedJob': { en: 'Job deleted', ta: 'வேலை நீக்கப்பட்டது' },
  'emp.confirmDelete': { en: 'Delete this job?', ta: 'இந்த வேலையை நீக்கவா?' },
  'emp.statusUpdated': { en: 'Status updated', ta: 'நிலை புதுப்பிக்கப்பட்டது' },
  'emp.closeJob': { en: 'Close', ta: 'மூடு' },
  'emp.companyProfile': { en: 'Company Profile', ta: 'நிறுவன சுயவிவரம்' },

  // ---- Post job ----
  'post.title': { en: 'Post a Job', ta: 'வேலை இடுக' },
  'post.jobTitle': { en: 'Job Title', ta: 'வேலை பெயர்' },
  'post.category': { en: 'Category', ta: 'வகை' },
  'post.company': { en: 'Company Name', ta: 'நிறுவனப் பெயர்' },
  'post.description': { en: 'Job Description', ta: 'வேலை விளக்கம்' },
  'post.city': { en: 'City / Town', ta: 'நகரம் / ஊர்' },
  'post.area': { en: 'Area (optional)', ta: 'பகுதி (விருப்பம்)' },
  'post.salaryMin': { en: 'Salary Min (₹)', ta: 'குறைந்த சம்பளம் (₹)' },
  'post.salaryMax': { en: 'Salary Max (₹)', ta: 'அதிக சம்பளம் (₹)' },
  'post.salaryPeriod': { en: 'Salary Period', ta: 'சம்பள காலம்' },
  'post.experience': { en: 'Experience Required', ta: 'தேவையான அனுபவம்' },
  'post.qualification': { en: 'Qualification', ta: 'தகுதி' },
  'post.skills': { en: 'Required Skills (comma separated)', ta: 'தேவையான திறமைகள் (கமாவால் பிரிக்கவும்)' },
  'post.vacancies': { en: 'Number of Vacancies', ta: 'காலியிடங்கள் எண்ணிக்கை' },
  'post.deadline': { en: 'Application Deadline (YYYY-MM-DD)', ta: 'விண்ணப்ப கடைசி தேதி (YYYY-MM-DD)' },
  'post.contact': { en: 'Contact Phone', ta: 'தொடர்பு கைபேசி' },
  'post.quickJob': { en: '⚡ Quick Job (daily wage / need today)', ta: '⚡ உடனடி வேலை (தினசரி கூலி)' },
  'post.wfh': { en: '🏠 Work from home', ta: '🏠 வீட்டிலிருந்து வேலை' },
  'post.posted': { en: 'Job posted. Waiting for admin approval', ta: 'வேலை இடப்பட்டது. நிர்வாக அனுமதிக்காக காத்திருக்கவும்' },

  // ---- Job types / periods / categories ----
  'jt.FULL_TIME': { en: 'Full Time', ta: 'முழு நேரம்' },
  'jt.PART_TIME': { en: 'Part Time', ta: 'பகுதி நேரம்' },
  'jt.WORK_FROM_HOME': { en: 'Work From Home', ta: 'வீட்டிலிருந்து' },
  'jt.DAILY_WAGE': { en: 'Daily Wage', ta: 'தினசரி கூலி' },
  'jt.CONTRACT': { en: 'Contract', ta: 'ஒப்பந்தம்' },
  'jt.INTERNSHIP': { en: 'Internship', ta: 'பயிற்சி' },
  'sp.HOURLY': { en: '/hour', ta: '/மணி' },
  'sp.DAILY': { en: '/day', ta: '/நாள்' },
  'sp.WEEKLY': { en: '/week', ta: '/வாரம்' },
  'sp.MONTHLY': { en: '/month', ta: '/மாதம்' },
  'sp.YEARLY': { en: '/year', ta: '/ஆண்டு' },

  // ---- Employers / applicants ----
  'app.jobTitle': { en: 'Job', ta: 'வேலை' },
  'app.applicant': { en: 'Applicant', ta: 'விண்ணப்பதாரர்' },
  'app.contact': { en: 'Contact', ta: 'தொடர்பு' },
  'app.shortlist': { en: 'Shortlist', ta: 'பட்டியலிடு' },
  'app.reject': { en: 'Reject', ta: 'நிராகரி' },
  'app.select': { en: 'Select', ta: 'தேர்வு' },
  'app.underReview': { en: 'Under Review', ta: 'ஆய்வு' },
  'app.noApplicants': { en: 'No applicants yet', ta: 'இன்னும் விண்ணப்பதாரர்கள் இல்லை' },
  'app.skills': { en: 'Skills', ta: 'திறமைகள்' },
  'app.exp': { en: 'Experience', ta: 'அனுபவம்' },
  'app.years': { en: 'yrs', ta: 'ஆண்டு' },

  // ---- Misc ----
  'misc.loading': { en: 'Loading…', ta: 'ஏற்றுகிறது…' },
  'misc.error': { en: 'Something went wrong', ta: 'ஏதோ தவறு ஏற்பட்டது' },
  'misc.networkError': { en: 'Cannot reach server. Check your connection.', ta: 'சர்வரை அணுக முடியவில்லை. இணைப்பை சரிபார்க்கவும்.' },
  'misc.required': { en: 'This field is required', ta: 'இந்த புலம் தேவை' },
  'misc.invalidMobile': { en: 'Enter a valid 10-digit mobile number', ta: 'சரியான 10 இலக்க கைபேசி எண்ணை உள்ளிடவும்' },
  'misc.locationPermission': { en: 'Location permission needed to show nearby jobs', ta: 'அருகில் வேலைகளைக் காட்ட இடம் அனுமதி தேவை' },
  'misc.selectReason': { en: 'Select a reason', ta: 'காரணத்தைத் தேர்ந்தெடுக்கவும்' },
  'misc.verifyBadge': { en: '🟢 Verified', ta: '🟢 சரிபார்க்கப்பட்டது' },
};

export function t(key: string, lang: Lang): string {
  const entry = translations[key];
  if (!entry) return key;
  return entry[lang];
}
