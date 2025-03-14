/*
  # Add tenant documents and report data

  1. Changes
    - Add documents for user 1@gmail.com
    - Add report data with medium-range scores
    - Set verification status for documents

  2. Security
    - Maintain existing RLS policies
*/

-- Insert documents for user 1@gmail.com
DO $$
DECLARE
  user_id uuid;
BEGIN
  -- Get user ID for 1@gmail.com
  SELECT id INTO user_id FROM users WHERE email = '1@gmail.com';

  IF user_id IS NOT NULL THEN
    -- Credit Report
    INSERT INTO documents (
      id,
      user_id,
      title,
      type,
      status,
      file_path,
      verified,
      verification_date,
      score,
      report_data
    ) VALUES (
      gen_random_uuid(),
      user_id,
      'Credit Report - March 2024',
      'credit_report',
      'signed',
      user_id || '/credit_report.pdf',
      true,
      now(),
      680,
      jsonb_build_object(
        'credit_score', 680,
        'payment_history', jsonb_build_object(
          'score', 85,
          'late_payments', 1,
          'on_time_payments', 24
        ),
        'credit_utilization', jsonb_build_object(
          'score', 75,
          'total_available', 15000,
          'total_used', 4500
        ),
        'length_of_history', jsonb_build_object(
          'score', 70,
          'average_age', '3 years'
        ),
        'recommendations', jsonb_build_array(
          'Consider reducing credit utilization',
          'Maintain consistent payment history',
          'Keep older accounts open'
        )
      )
    );

    -- Criminal Background Check
    INSERT INTO documents (
      id,
      user_id,
      title,
      type,
      status,
      file_path,
      verified,
      verification_date,
      report_data
    ) VALUES (
      gen_random_uuid(),
      user_id,
      'Criminal Background Check - March 2024',
      'criminal_report',
      'signed',
      user_id || '/criminal_report.pdf',
      true,
      now(),
      jsonb_build_object(
        'status', 'clear',
        'records_found', 0,
        'jurisdictions_checked', jsonb_build_array(
          'Federal',
          'State',
          'County'
        ),
        'verification_details', jsonb_build_object(
          'method', 'national_database',
          'date_completed', now()
        )
      )
    );

    -- Eviction History
    INSERT INTO documents (
      id,
      user_id,
      title,
      type,
      status,
      file_path,
      verified,
      verification_date,
      report_data
    ) VALUES (
      gen_random_uuid(),
      user_id,
      'Eviction History Report - March 2024',
      'eviction_report',
      'signed',
      user_id || '/eviction_report.pdf',
      true,
      now(),
      jsonb_build_object(
        'status', 'clear',
        'records_found', 0,
        'years_checked', 7,
        'states_checked', jsonb_build_array(
          'CA',
          'WA',
          'OR'
        ),
        'verification_details', jsonb_build_object(
          'method', 'national_database',
          'date_completed', now()
        )
      )
    );

    -- Income Verification
    INSERT INTO documents (
      id,
      user_id,
      title,
      type,
      status,
      file_path,
      verified,
      verification_date,
      report_data
    ) VALUES (
      gen_random_uuid(),
      user_id,
      'Income Verification - March 2024',
      'income_verification',
      'signed',
      user_id || '/income_verification.pdf',
      true,
      now(),
      jsonb_build_object(
        'employment_status', 'full_time',
        'employer', 'Tech Corp Inc.',
        'position', 'Software Developer',
        'length_of_employment', '2 years',
        'annual_income', 85000,
        'monthly_income', 7083,
        'income_stability', 'high',
        'verification_method', 'employer_verification',
        'additional_income', jsonb_build_object(
          'type', 'freelance',
          'monthly_average', 1000
        ),
        'debt_to_income_ratio', 0.28
      )
    );
  END IF;
END $$;