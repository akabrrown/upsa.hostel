# Database Schema Documentation - UPSA Hostel Management System

## Overview
This document describes the complete database schema for the UPSA Hostel Management System, including all tables, relationships, indexes, and constraints.

## Database Technology
- **Database**: PostgreSQL (recommended) / MySQL (alternative)
- **ORM**: Prisma
- **Migration**: Prisma Migrate
- **Connection**: Connection pooling with pgbouncer (PostgreSQL)

## Core Tables

### Users
Stores all user accounts and authentication information.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@upsa\.edu\.gh$'),
    CONSTRAINT users_role_check CHECK (role IN ('student', 'admin', 'porter', 'director'))
);

CREATE TYPE user_role AS ENUM ('student', 'admin', 'porter', 'director');
```

**Indexes:**
- `users_email_unique` (UNIQUE)
- `users_role_index` (role)
- `users_active_index` (is_active)
- `users_created_at_index` (created_at)

### Students
Extended student-specific information.

```sql
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    index_number VARCHAR(8) UNIQUE NOT NULL,
    program_of_study VARCHAR(100) NOT NULL,
    level VARCHAR(20) NOT NULL,
    phone VARCHAR(20),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    admission_date DATE,
    graduation_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT students_index_number_check CHECK (index_number ~* '^[0-9]{8}$'),
    CONSTRAINT students_level_check CHECK (level IN ('100', '200', '300', '400', 'Graduate'))
);

CREATE INDEX students_user_id_index ON students(user_id);
CREATE INDEX students_index_number_index ON students(index_number);
CREATE INDEX students_program_index ON students(program_of_study);
```

### Hostels
Information about hostel buildings.

```sql
CREATE TABLE hostels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    address TEXT,
    total_floors INTEGER NOT NULL DEFAULT 1,
    total_rooms INTEGER NOT NULL DEFAULT 0,
    capacity INTEGER NOT NULL DEFAULT 0,
    warden_name VARCHAR(100),
    warden_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT hostels_capacity_check CHECK (capacity >= 0),
    CONSTRAINT hostels_floors_check CHECK (total_floors >= 1)
);

CREATE INDEX hostels_code_index ON hostels(code);
CREATE INDEX hostels_active_index ON hostels(is_active);
```

### Rooms
Individual room information within hostels.

```sql
CREATE TABLE rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hostel_id UUID NOT NULL REFERENCES hostels(id) ON DELETE CASCADE,
    floor_number INTEGER NOT NULL,
    room_number VARCHAR(20) NOT NULL,
    room_type room_type_enum NOT NULL DEFAULT 'double',
    capacity INTEGER NOT NULL DEFAULT 2,
    current_occupancy INTEGER NOT NULL DEFAULT 0,
    price_per_semester DECIMAL(10,2) NOT NULL,
    amenities JSONB DEFAULT '[]',
    is_available BOOLEAN DEFAULT true,
    maintenance_status VARCHAR(20) DEFAULT 'good',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT rooms_capacity_check CHECK (capacity > 0),
    CONSTRAINT rooms_occupancy_check CHECK (current_occupancy >= 0 AND current_occupancy <= capacity),
    CONSTRAINT rooms_price_check CHECK (price_per_semester > 0),
    UNIQUE(hostel_id, floor_number, room_number)
);

CREATE TYPE room_type_enum AS ENUM ('single', 'double', 'triple', 'quad', 'suite');

CREATE INDEX rooms_hostel_index ON rooms(hostel_id);
CREATE INDEX rooms_type_index ON rooms(room_type);
CREATE INDEX rooms_available_index ON rooms(is_available);
CREATE INDEX rooms_price_index ON rooms(price_per_semester);
```

### Room_Allocations
Student room assignments.

```sql
CREATE TABLE room_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status allocation_status NOT NULL DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT allocations_status_check CHECK (status IN ('active', 'inactive', 'transferred', 'vacated')),
    CONSTRAINT allocations_semester_check CHECK (semester IN ('first', 'second', 'summer')),
    UNIQUE(student_id, semester, academic_year)
);

CREATE TYPE allocation_status AS ENUM ('active', 'inactive', 'transferred', 'vacated');

CREATE INDEX allocations_student_index ON room_allocations(student_id);
CREATE INDEX allocations_room_index ON room_allocations(room_id);
CREATE INDEX allocations_semester_index ON room_allocations(semester, academic_year);
CREATE INDEX allocations_status_index ON room_allocations(status);
```

### Payments
Student payment records.

```sql
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'pending',
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    payment_date TIMESTAMP,
    receipt_number VARCHAR(50) UNIQUE,
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT payments_amount_check CHECK (amount > 0),
    CONSTRAINT payments_receipt_check CHECK (receipt_number IS NOT NULL OR payment_status = 'pending')
);

CREATE TYPE payment_method_enum AS ENUM ('cash', 'bank_transfer', 'mobile_money', 'credit_card');
CREATE TYPE payment_status_enum AS ENUM ('pending', 'completed', 'failed', 'refunded');

CREATE INDEX payments_student_index ON payments(student_id);
CREATE INDEX payments_status_index ON payments(payment_status);
CREATE INDEX payments_semester_index ON payments(semester, academic_year);
CREATE INDEX payments_date_index ON payments(payment_date);
CREATE INDEX payments_receipt_index ON payments(receipt_number);
```

### Announcements
System announcements and notifications.

```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    category announcement_category NOT NULL DEFAULT 'general',
    priority announcement_priority NOT NULL DEFAULT 'medium',
    target_audience TEXT[] DEFAULT ARRAY['student'],
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    published_at TIMESTAMP,
    expires_at TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT announcements_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT announcements_dates_check CHECK (expires_at IS NULL OR expires_at > published_at)
);

CREATE TYPE announcement_category AS ENUM ('general', 'academic', 'payment', 'maintenance', 'emergency');
CREATE TYPE announcement_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE INDEX announcements_category_index ON announcements(category);
CREATE INDEX announcements_priority_index ON announcements(priority);
CREATE INDEX announcements_author_index ON announcements(author_id);
CREATE INDEX announcements_active_index ON announcements(is_active);
CREATE INDEX announcements_published_index ON announcements(published_at);
```

### Porters
Porter staff information.

```sql
CREATE TABLE porters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    employee_id VARCHAR(20) UNIQUE NOT NULL,
    assigned_hostel_id UUID REFERENCES hostels(id),
    shift_schedule VARCHAR(50),
    phone VARCHAR(20),
    emergency_contact VARCHAR(20),
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX porters_user_index ON porters(user_id);
CREATE INDEX porters_hostel_index ON porters(assigned_hostel_id);
CREATE INDEX porters_employee_index ON porters(employee_id);
```

### Check_Ins
Student check-in records.

```sql
CREATE TABLE check_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    porter_id UUID NOT NULL REFERENCES porters(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    purpose VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX check_ins_student_index ON check_ins(student_id);
CREATE INDEX check_ins_porter_index ON check_ins(porter_id);
CREATE INDEX check_ins_time_index ON check_ins(check_in_time);
```

### Check_Outs
Student check-out records.

```sql
CREATE TABLE check_outs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    porter_id UUID NOT NULL REFERENCES porters(id) ON DELETE CASCADE,
    check_out_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expected_return TIMESTAMP,
    purpose VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX check_outs_student_index ON check_outs(student_id);
CREATE INDEX check_outs_porter_index ON check_outs(porter_id);
CREATE INDEX check_outs_time_index ON check_outs(check_out_time);
```

### Maintenance_Requests
Room maintenance requests.

```sql
CREATE TABLE maintenance_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    reported_by UUID REFERENCES porters(id) ON DELETE SET NULL,
    issue_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    priority maintenance_priority NOT NULL DEFAULT 'medium',
    status maintenance_status NOT NULL DEFAULT 'pending',
    reported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT maintenance_priority_check CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    CONSTRAINT maintenance_status_check CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled'))
);

CREATE TYPE maintenance_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE maintenance_status AS ENUM ('pending', 'in_progress', 'resolved', 'cancelled');

CREATE INDEX maintenance_room_index ON maintenance_requests(room_id);
CREATE INDEX maintenance_status_index ON maintenance_requests(status);
CREATE INDEX maintenance_priority_index ON maintenance_requests(priority);
CREATE INDEX maintenance_reported_index ON maintenance_requests(reported_at);
```

### Files
File upload records and metadata.

```sql
CREATE TABLE files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size_bytes BIGINT NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_purpose file_purpose_enum NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT files_size_check CHECK (size_bytes > 0),
    CONSTRAINT files_path_check CHECK (file_path IS NOT NULL)
);

CREATE TYPE file_purpose_enum AS ENUM ('student_id', 'admission_letter', 'payment_proof', 'profile_photo', 'document', 'other');

CREATE INDEX files_purpose_index ON files(file_purpose);
CREATE INDEX files_uploaded_by_index ON files(uploaded_by);
CREATE INDEX files_active_index ON files(is_active);
```

### Audit_Logs
System audit trail for security and compliance.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id UUID,
    ip_address INET,
    user_agent TEXT,
    success BOOLEAN NOT NULL DEFAULT true,
    details JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX audit_logs_user_index ON audit_logs(user_id);
CREATE INDEX audit_logs_action_index ON audit_logs(action);
CREATE INDEX audit_logs_resource_index ON audit_logs(resource_type, resource_id);
CREATE INDEX audit_logs_created_index ON audit_logs(created_at);
CREATE INDEX audit_logs_ip_index ON audit_logs(ip_address);
```

### System_Settings
Application configuration settings.

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX system_settings_key_index ON system_settings(key);
CREATE INDEX system_settings_public_index ON system_settings(is_public);
```

## Relationships and Foreign Keys

### Primary Relationships
1. **Users → Students** (1:1)
2. **Users → Porters** (1:1)
3. **Students → Room_Allocations** (1:N)
4. **Rooms → Room_Allocations** (1:N)
5. **Students → Payments** (1:N)
6. **Hostels → Rooms** (1:N)
7. **Porters → Check_Ins/Check_Outs** (1:N)
8. **Rooms → Maintenance_Requests** (1:N)
9. **Users → Announcements** (1:N)
10. **Users → Files** (1:N)

### Cascade Rules
- **CASCADE DELETE**: Used for dependent records (student allocations, files)
- **SET NULL**: Used for optional references (porter_id in maintenance)
- **RESTRICT**: Used for critical references to prevent accidental deletion

## Indexes Strategy

### Primary Indexes
- All tables have UUID primary keys with automatic indexing
- Unique constraints on natural keys (email, index_number, receipt_number)

### Performance Indexes
- Foreign key indexes for join performance
- Composite indexes for common query patterns
- Partial indexes for filtered queries
- JSONB indexes for structured data

### Query Optimization
```sql
-- Common query patterns and their indexes

-- Student lookup by index number
CREATE INDEX students_lookup_index ON students(index_number);

-- Student payments by semester/year
CREATE INDEX payments_semester_student_index ON payments(semester, academic_year, student_id);

-- Room availability by hostel
CREATE INDEX rooms_hostel_available_index ON rooms(hostel_id, is_available);

-- Recent announcements
CREATE INDEX announcements_recent_index ON announcements(published_at DESC) WHERE is_active = true;
```

## Data Integrity Constraints

### Check Constraints
- Email format validation (@upsamail.edu.gh)
- Index number format (8 digits)
- Payment amounts (positive values)
- Room capacity vs occupancy
- Date ranges and logical constraints

### Unique Constraints
- Email addresses
- Index numbers
- Receipt numbers
- Room identification (hostel + floor + room number)

### Not Null Constraints
- Essential fields marked as NOT NULL
- Foreign key references enforced
- Timestamp defaults for audit trails

## Security Considerations

### Data Protection
- Sensitive data hashed (passwords)
- PII protection in audit logs
- File access controls
- IP address logging for security

### Access Control
- Role-based data access
- Row-level security (optional)
- Audit trail for all changes
- Data retention policies

## Migration Strategy

### Version Control
- All schema changes through Prisma migrations
- Migration files versioned in Git
- Rollback scripts available
- Test migrations in staging

### Data Migration
- Backup before major changes
- Incremental migration for large datasets
- Validation scripts post-migration
- Performance monitoring during migration

## Performance Optimization

### Database Configuration
```sql
-- PostgreSQL performance settings
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
checkpoint_completion_target = 0.9
wal_buffers = 16MB
default_statistics_target = 100
```

### Query Optimization
- Use EXPLAIN ANALYZE for slow queries
- Optimize JOIN operations
- Implement query caching
- Monitor query performance

### Connection Pooling
- PgBouncer for connection management
- Appropriate pool sizing
- Connection timeout configuration
- Health check monitoring

## Backup and Recovery

### Backup Strategy
- Daily full backups
- Hourly transaction log backups
- Off-site backup storage
- Backup verification procedures

### Recovery Procedures
- Point-in-time recovery capability
- Disaster recovery plan
- Recovery time objectives
- Data validation post-recovery

## Monitoring and Maintenance

### Performance Monitoring
- Query performance metrics
- Index usage statistics
- Database size monitoring
- Connection pool monitoring

### Maintenance Tasks
- Regular VACUUM and ANALYZE
- Index rebuild schedules
- Statistics updates
- Log rotation

## Development Environment

### Local Development
- Docker Compose setup
- Seed data scripts
- Test database isolation
- Development migrations

### Testing Strategy
- Unit tests with test database
- Integration tests with real data
- Performance test datasets
- Data privacy in testing

## Documentation Updates

### Schema Changes
- Update this document for all changes
- Maintain migration history
- Document breaking changes
- Update related documentation

### Data Dictionary
Maintain comprehensive data dictionary with:
- Field descriptions
- Business rules
- Data formats
- Example values

## Contact and Support

### Database Administration
- **DBA Team**: dba@upsamail.edu.gh
- **Emergency**: dba-emergency@upsamail.edu.gh
- **Documentation**: Available in project repository

### Development Support
- **Backend Team**: backend@upsamail.edu.gh
- **DevOps**: devops@upsamail.edu.gh
- **Issue Tracking**: GitHub repository issues

This schema documentation provides a comprehensive reference for the UPSA Hostel Management System database structure and should be kept current with all schema changes.
